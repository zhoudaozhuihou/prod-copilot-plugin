/**
 * Request context collector.
 *
 * This module implements Copilot-Prompt-Optimizer-style context awareness for
 * every @product-dev command. It collects:
 * - raw user prompt
 * - active editor language, file, selection, and surrounding code
 * - chat attachments / references supplied via VS Code Chat
 * - lightweight metadata that can be injected into the prompt optimizer
 *
 * The reader is defensive because VS Code Chat reference values can vary by
 * version and by attachment type. Text-like files are read with strict limits;
 * binary files are summarized but not injected into the prompt body.
 */

import * as vscode from 'vscode';
import * as path from 'path';

export interface ActiveEditorContext {
  languageId: string;
  fileName: string;
  relativePath?: string;
  selectionText: string;
  surroundingCode: string;
  lineCount: number;
  startLine: number;
  endLine: number;
}

export interface AttachmentItemContext {
  name: string;
  kind: 'file' | 'selection' | 'uri' | 'text' | 'binary' | 'unknown';
  path?: string;
  mimeType?: string;
  size?: number;
  excerpt: string;
  warning?: string;
}

export interface RequestContext {
  activeEditor?: ActiveEditorContext;
  attachments: AttachmentItemContext[];
  attachmentSummary: string;
  warnings: string[];
}

const MAX_TEXT_BYTES = 128 * 1024;
const MAX_EXCERPT_CHARS = 12000;
const SURROUNDING_LINES = 25;

export async function collectRequestContext(request: vscode.ChatRequest, workspaceRoot?: string): Promise<RequestContext> {
  const warnings: string[] = [];
  const activeEditor = collectActiveEditorContext(workspaceRoot);
  const attachments = await collectAttachmentItems(request, warnings);
  const attachmentSummary = renderAttachmentContext({ activeEditor, attachments, attachmentSummary: '', warnings });
  return { activeEditor, attachments, attachmentSummary, warnings };
}

export function collectActiveEditorContext(workspaceRoot?: string): ActiveEditorContext | undefined {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return undefined;

  const document = editor.document;
  const selection = editor.selection;
  const startLine = Math.max(0, selection.start.line - SURROUNDING_LINES);
  const endLine = Math.min(document.lineCount - 1, selection.end.line + SURROUNDING_LINES);
  const selectionText = document.getText(selection);
  const surroundingCode = document.getText(new vscode.Range(startLine, 0, endLine, document.lineAt(endLine).text.length));
  const relativePath = workspaceRoot ? path.relative(workspaceRoot, document.uri.fsPath).replace(/\\/g, '/') : undefined;

  return {
    languageId: document.languageId,
    fileName: path.basename(document.uri.fsPath || document.fileName),
    relativePath,
    selectionText,
    surroundingCode: truncate(surroundingCode, MAX_EXCERPT_CHARS),
    lineCount: document.lineCount,
    startLine: startLine + 1,
    endLine: endLine + 1,
  };
}

async function collectAttachmentItems(request: vscode.ChatRequest, warnings: string[]): Promise<AttachmentItemContext[]> {
  const items: AttachmentItemContext[] = [];
  const rawRequest = request as unknown as Record<string, unknown>;
  const references = Array.isArray(rawRequest.references) ? rawRequest.references : [];
  const variables = Array.isArray(rawRequest.variables) ? rawRequest.variables : [];
  const combined = [...references, ...variables];

  for (const raw of combined) {
    try {
      const item = await readReferenceLikeValue(raw);
      if (item) items.push(item);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      warnings.push(`Failed to read one chat attachment/reference: ${message}`);
    }
  }

  return dedupeAttachments(items).slice(0, 12);
}

async function readReferenceLikeValue(raw: unknown): Promise<AttachmentItemContext | undefined> {
  const ref = raw as Record<string, unknown>;
  const value = (ref?.value ?? ref) as unknown;
  const name = String(ref?.name ?? ref?.id ?? inferReferenceName(value));

  const binary = await tryReadBinaryData(value, name);
  if (binary) return binary;

  const uri = extractUri(value);
  if (uri) return readUriAsAttachment(uri, name);

  const text = extractText(value);
  if (text) {
    return {
      name,
      kind: 'text',
      size: text.length,
      excerpt: truncate(text, MAX_EXCERPT_CHARS),
    };
  }

  const printable = safeStringify(value);
  if (printable && printable !== '{}') {
    return { name, kind: 'unknown', size: printable.length, excerpt: truncate(printable, 4000) };
  }

  return undefined;
}

async function tryReadBinaryData(value: unknown, fallbackName: string): Promise<AttachmentItemContext | undefined> {
  const anyValue = value as { mimeType?: string; data?: () => PromiseLike<Uint8Array>; reference?: vscode.Uri };
  if (typeof anyValue?.data !== 'function') return undefined;

  const data = await anyValue.data();
  const mimeType = anyValue.mimeType || 'application/octet-stream';
  const isTextLike = /^text\//i.test(mimeType) || /(json|xml|yaml|yml|markdown|csv|sql|javascript|typescript)/i.test(mimeType);
  if (!isTextLike) {
    return {
      name: fallbackName,
      kind: 'binary',
      mimeType,
      path: anyValue.reference?.fsPath,
      size: data.byteLength,
      excerpt: `[binary attachment omitted: ${mimeType}, ${data.byteLength} bytes]`,
      warning: 'Binary attachment was not injected into the prompt. Attach a text export or source file for model grounding.',
    };
  }

  const slice = data.byteLength > MAX_TEXT_BYTES ? data.slice(0, MAX_TEXT_BYTES) : data;
  const text = new TextDecoder('utf-8', { fatal: false }).decode(slice);
  return {
    name: fallbackName,
    kind: 'text',
    mimeType,
    path: anyValue.reference?.fsPath,
    size: data.byteLength,
    excerpt: truncate(text, MAX_EXCERPT_CHARS),
    warning: data.byteLength > MAX_TEXT_BYTES ? `Attachment truncated to ${MAX_TEXT_BYTES} bytes.` : undefined,
  };
}

function extractUri(value: unknown): vscode.Uri | undefined {
  const anyValue = value as Record<string, unknown> | undefined;
  if (!anyValue) return undefined;

  if (isUriLike(anyValue)) return anyValue as unknown as vscode.Uri;
  if (isUriLike(anyValue.uri)) return anyValue.uri as vscode.Uri;
  if (isUriLike(anyValue.reference)) return anyValue.reference as vscode.Uri;
  if (typeof anyValue.fsPath === 'string') return vscode.Uri.file(anyValue.fsPath);

  const location = anyValue as { uri?: vscode.Uri; range?: vscode.Range };
  if (isUriLike(location?.uri)) return location.uri;

  return undefined;
}

function extractText(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  const anyValue = value as Record<string, unknown> | undefined;
  if (!anyValue) return undefined;
  for (const key of ['text', 'content', 'value', 'message']) {
    if (typeof anyValue[key] === 'string') return anyValue[key] as string;
  }
  return undefined;
}

async function readUriAsAttachment(uri: vscode.Uri, fallbackName: string): Promise<AttachmentItemContext> {
  const stat = await vscode.workspace.fs.stat(uri);
  if (stat.type === vscode.FileType.Directory) {
    return {
      name: fallbackName,
      kind: 'uri',
      path: uri.fsPath,
      size: stat.size,
      excerpt: `[directory reference omitted: ${uri.toString()}]`,
      warning: 'Directory references are summarized only. Attach specific files for stronger grounding.',
    };
  }

  const bytes = await vscode.workspace.fs.readFile(uri);
  const kind = classifyAttachmentKind(uri);
  const isTextLike = isTextFile(uri);
  if (!isTextLike) {
    return {
      name: fallbackName || path.basename(uri.fsPath),
      kind: 'binary',
      path: uri.fsPath,
      size: bytes.byteLength,
      excerpt: `[binary file omitted: ${uri.toString()}, ${bytes.byteLength} bytes]`,
      warning: 'Binary file was not injected into the prompt. Attach source text, markdown, SQL, JSON, YAML, or CSV when possible.',
    };
  }

  const slice = bytes.byteLength > MAX_TEXT_BYTES ? bytes.slice(0, MAX_TEXT_BYTES) : bytes;
  const text = new TextDecoder('utf-8', { fatal: false }).decode(slice);
  return {
    name: fallbackName || path.basename(uri.fsPath),
    kind,
    path: uri.fsPath,
    size: bytes.byteLength,
    excerpt: truncate(text, MAX_EXCERPT_CHARS),
    warning: bytes.byteLength > MAX_TEXT_BYTES ? `Attachment truncated to ${MAX_TEXT_BYTES} bytes.` : undefined,
  };
}

function classifyAttachmentKind(uri: vscode.Uri): AttachmentItemContext['kind'] {
  if (uri.scheme === 'file') return 'file';
  if (uri.scheme) return 'uri';
  return 'unknown';
}

function isTextFile(uri: vscode.Uri): boolean {
  const ext = path.extname(uri.fsPath || uri.path).toLowerCase();
  const textExts = new Set([
    '.txt', '.md', '.mdx', '.json', '.jsonc', '.yaml', '.yml', '.xml', '.csv', '.tsv', '.sql', '.ddl', '.dml',
    '.js', '.jsx', '.ts', '.tsx', '.java', '.py', '.go', '.rs', '.kt', '.scala', '.sh', '.bash', '.zsh', '.ps1',
    '.html', '.css', '.scss', '.less', '.vue', '.svelte', '.properties', '.ini', '.env', '.toml', '.gradle', '.pom'
  ]);
  return textExts.has(ext) || ext === '';
}

function isUriLike(value: unknown): boolean {
  const candidate = value as { scheme?: unknown; path?: unknown; fsPath?: unknown } | undefined;
  return !!candidate && typeof candidate.scheme === 'string' && typeof candidate.path === 'string';
}

function inferReferenceName(value: unknown): string {
  const anyValue = value as Record<string, unknown> | undefined;
  if (!anyValue) return 'chat-reference';
  if (typeof anyValue.fsPath === 'string') return path.basename(anyValue.fsPath);
  if (typeof anyValue.path === 'string') return path.basename(anyValue.path);
  if (typeof anyValue.name === 'string') return anyValue.name;
  return 'chat-reference';
}

function dedupeAttachments(items: AttachmentItemContext[]): AttachmentItemContext[] {
  const seen = new Set<string>();
  const result: AttachmentItemContext[] = [];
  for (const item of items) {
    const key = `${item.path ?? item.name}:${item.size ?? item.excerpt.length}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export function renderRequestContext(context?: RequestContext): string {
  if (!context) return '## Request Context\n\n- No request context was collected.';
  return renderAttachmentContext(context);
}

function renderAttachmentContext(context: RequestContext): string {
  const sections: string[] = ['## Request Context'];
  if (context.activeEditor) {
    const editor = context.activeEditor;
    sections.push([
      '### Active Editor Context',
      `- File: ${editor.relativePath ?? editor.fileName}`,
      `- Language: ${editor.languageId}`,
      `- Lines included: ${editor.startLine}-${editor.endLine} of ${editor.lineCount}`,
      editor.selectionText
        ? `- Selected text:\n\n\`\`\`${editor.languageId}\n${truncate(editor.selectionText, MAX_EXCERPT_CHARS)}\n\`\`\``
        : `- Surrounding code:\n\n\`\`\`${editor.languageId}\n${editor.surroundingCode}\n\`\`\``
    ].join('\n'));
  }

  if (context.attachments.length) {
    sections.push('### Chat Attachments / References');
    for (const item of context.attachments) {
      sections.push([
        `#### ${item.name}`,
        `- Kind: ${item.kind}`,
        item.path ? `- Path: ${item.path}` : undefined,
        item.mimeType ? `- MIME: ${item.mimeType}` : undefined,
        typeof item.size === 'number' ? `- Size: ${item.size} bytes` : undefined,
        item.warning ? `- Warning: ${item.warning}` : undefined,
        '',
        '```text',
        item.excerpt,
        '```'
      ].filter(Boolean).join('\n'));
    }
  } else {
    sections.push('### Chat Attachments / References\n\n- No chat attachments or file references were found.');
  }

  if (context.warnings.length) {
    sections.push(`### Context Warnings\n\n${context.warnings.map(w => `- ${w}`).join('\n')}`);
  }

  return sections.join('\n\n');
}

function safeStringify(value: unknown): string | undefined {
  try {
    return JSON.stringify(value, (_key, val) => {
      if (typeof val === 'function') return '[function]';
      if (val instanceof Uint8Array) return `[Uint8Array:${val.byteLength}]`;
      return val;
    }, 2);
  } catch {
    return undefined;
  }
}

function truncate(value: string, max: number): string {
  if (!value) return '';
  return value.length > max ? `${value.slice(0, max)}\n\n...[truncated to ${max} chars]` : value;
}
