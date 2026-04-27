import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

export interface AttachmentContext {
  label: string;
  uri?: string;
  content?: string;
  warning?: string;
}

export interface RequestContext {
  workspaceRoot?: string;
  activeFile?: string;
  selectedText?: string;
  surroundingText?: string;
  attachments: AttachmentContext[];
  references: AttachmentContext[];
}

const TEXT_EXTENSIONS = new Set([
  '.md', '.txt', '.csv', '.tsv', '.sql', '.ddl', '.dml', '.json', '.jsonc', '.yaml', '.yml', '.xml',
  '.ts', '.tsx', '.js', '.jsx', '.java', '.py', '.go', '.html', '.css', '.scss', '.vue',
  '.properties', '.env', '.toml', '.gradle', '.kt', '.sh', '.http'
]);

export async function collectRequestContext(request: vscode.ChatRequest, workspaceRoot?: string): Promise<RequestContext> {
  const editor = vscode.window.activeTextEditor;
  let selectedText = '';
  let surroundingText = '';
  let activeFile = '';

  if (editor) {
    activeFile = editor.document.uri.fsPath;
    selectedText = editor.document.getText(editor.selection);
    const start = Math.max(0, editor.selection.start.line - 80);
    const end = Math.min(editor.document.lineCount - 1, editor.selection.end.line + 80);
    surroundingText = editor.document.getText(new vscode.Range(start, 0, end, editor.document.lineAt(end).text.length));
  }

  const refs = await readChatReferences((request as any).references ?? []);
  const attachments = await readChatReferences((request as any).attachments ?? []);

  return { workspaceRoot, activeFile, selectedText, surroundingText, attachments, references: refs };
}

async function readChatReferences(items: any[]): Promise<AttachmentContext[]> {
  const result: AttachmentContext[] = [];
  for (const item of items ?? []) {
    const uri = item?.value instanceof vscode.Uri ? item.value : item?.uri instanceof vscode.Uri ? item.uri : undefined;
    const label = item?.name ?? item?.label ?? uri?.fsPath ?? 'attachment';
    if (!uri?.fsPath) {
      result.push({ label, warning: 'Reference has no readable file URI.' });
      continue;
    }

    const ext = path.extname(uri.fsPath).toLowerCase();
    if (!TEXT_EXTENSIONS.has(ext)) {
      result.push({ label, uri: uri.fsPath, warning: `Skipped non-text attachment (${ext || 'unknown extension'}).` });
      continue;
    }

    try {
      const stat = await fs.stat(uri.fsPath);
      if (stat.size > 256_000) {
        result.push({ label, uri: uri.fsPath, warning: 'Skipped because file is larger than 256 KB. Use /compress or select a smaller range.' });
        continue;
      }
      const content = await fs.readFile(uri.fsPath, 'utf8');
      result.push({ label, uri: uri.fsPath, content });
    } catch (error) {
      result.push({ label, uri: uri.fsPath, warning: `Could not read attachment: ${String(error)}` });
    }
  }
  return result;
}

export function renderRequestContext(context?: RequestContext): string {
  if (!context) return 'No request context collected.';
  const chunks: string[] = [];
  if (context.activeFile) chunks.push(`## Active File\n${context.activeFile}`);
  if (context.selectedText) chunks.push(`## Selected Text\n\`\`\`\n${context.selectedText.slice(0, 12000)}\n\`\`\``);
  if (context.surroundingText && !context.selectedText) chunks.push(`## Surrounding Editor Text\n\`\`\`\n${context.surroundingText.slice(0, 12000)}\n\`\`\``);
  for (const item of [...context.references, ...context.attachments]) {
    if (item.content) chunks.push(`## Attachment: ${item.label}\nPath: ${item.uri ?? 'unknown'}\n\`\`\`\n${item.content.slice(0, 16000)}\n\`\`\``);
    if (item.warning) chunks.push(`## Attachment Warning: ${item.label}\n${item.warning}`);
  }
  return chunks.join('\n\n') || 'No active editor selection or readable attachment context.';
}
