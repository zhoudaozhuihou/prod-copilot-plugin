import * as fs from 'fs';
import * as path from 'path';

export interface ApiEndpointSignal {
  framework: 'springboot' | 'fastapi' | 'flask' | 'unknown';
  file: string;
  className?: string;
  methodName?: string;
  httpMethod: string;
  path: string;
  requestBody?: string;
  parameters: string[];
  securityHints: string[];
  validationHints: string[];
  serviceHints: string[];
}

export interface BackendApiScanResult {
  scannedFiles: number;
  endpoints: ApiEndpointSignal[];
  dtoHints: string[];
  warnings: string[];
  markdown: string;
}

const MAX_FILES = 240;
const MAX_FILE_SIZE = 180_000;

export function scanBackendApiSignals(workspaceRoot?: string): BackendApiScanResult {
  if (!workspaceRoot) {
    return renderResult(0, [], [], ['No workspace root was available. Attach backend files or open a workspace.']);
  }

  const files = walk(workspaceRoot)
    .filter(f => /\.(java|py)$/i.test(f))
    .filter(f => !/node_modules|target|build|dist|\.git|venv|__pycache__/i.test(f))
    .slice(0, MAX_FILES);

  const endpoints: ApiEndpointSignal[] = [];
  const dtoHints: string[] = [];
  const warnings: string[] = [];

  for (const file of files) {
    try {
      const stat = fs.statSync(file);
      if (stat.size > MAX_FILE_SIZE) continue;
      const content = fs.readFileSync(file, 'utf8');
      if (file.endsWith('.java')) {
        endpoints.push(...scanJavaSpring(file, content, workspaceRoot));
        dtoHints.push(...scanJavaDtos(file, content, workspaceRoot));
      } else if (file.endsWith('.py')) {
        endpoints.push(...scanPythonApi(file, content, workspaceRoot));
      }
    } catch (error) {
      warnings.push(`Could not scan ${file}: ${String(error)}`);
    }
  }

  return renderResult(files.length, endpoints, dtoHints.slice(0, 80), warnings);
}

function walk(dir: string): string[] {
  const out: string[] = [];
  const stack = [dir];
  while (stack.length && out.length < MAX_FILES * 3) {
    const cur = stack.pop()!;
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(cur, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      const p = path.join(cur, e.name);
      if (e.isDirectory()) {
        if (!/node_modules|target|build|dist|\.git|venv|__pycache__|\.idea|\.vscode/i.test(p)) stack.push(p);
      } else {
        out.push(p);
      }
    }
  }
  return out;
}

function scanJavaSpring(file: string, content: string, root: string): ApiEndpointSignal[] {
  if (!/@RestController|@Controller/.test(content)) return [];
  const rel = path.relative(root, file);
  const className = content.match(/class\s+([A-Za-z0-9_]+)/)?.[1];
  // Extract class-level @RequestMapping only (one that appears before the class declaration)
  const classReqMatch = content.match(/@RequestMapping\s*\(([^)]*)\)(?=[\s\S]{0,200}?\bclass\s+\w+)/);
  const classPath = normalizePath(extractMappingValue(classReqMatch?.[1] ?? ''));

  const endpoints: ApiEndpointSignal[] = [];

  // Match each mapping annotation individually, with optional parentheses for @*Mapping annotations.
  // @RequestMapping always requires parentheses and is handled in the second alternation branch.
  const annotationRegex = /@(?:(Get|Post|Put|Delete|Patch)Mapping(?:\s*\(([^)]*)\))?|RequestMapping\s*\(([^)]*)\))/g;
  let annMatch: RegExpExecArray | null;
  while ((annMatch = annotationRegex.exec(content))) {
    const mappingType = annMatch[1]; // 'Get', 'Post', etc., or undefined for @RequestMapping
    const mappingArgs = annMatch[2] ?? annMatch[3] ?? '';
    const annStr = annMatch[0];
    let afterText = content.slice(annMatch.index + annStr.length);

    // Skip class-level @RequestMapping (followed by a class/interface/enum/record declaration)
    if (!mappingType) {
      const nextTwoHundred = afterText.slice(0, 200);
      if (/\b(?:class|interface|enum|record)\s+\w+/.test(nextTwoHundred)) continue;
    }

    // Skip any additional annotations (like @PreAuthorize, @Secured, @Transactional)
    // between this mapping annotation and the method signature.
    const precedingAnnotations: string[] = [];
    while (/^\s*@/.test(afterText)) {
      const annMatch = afterText.match(/^(\s*@\w+(?:\([^)]*\))?)/);
      if (annMatch) {
        precedingAnnotations.push(annMatch[1].trim());
        afterText = afterText.slice(annMatch[1].length);
      } else {
        break;
      }
    }

    // Look ahead for the method signature: optional access modifier, return type, method name, params.
    const sigRegex = /(?:(?:public|private|protected)\s+)?([^;{]+?)\s*\(([^)]*)\)/;
    const sigMatch = afterText.match(sigRegex);
    if (!sigMatch) continue;

    const returnTypeStuff = sigMatch[1];
    const params = sigMatch[2];
    const methodNameMatch = returnTypeStuff.match(/(\w+)\s*$/);
    if (!methodNameMatch) continue;

    const methodName = methodNameMatch[1];

    // Guard rails: skip if the "method name" is actually a type keyword or annotation name
    if (/^(?:class|record|interface|enum)$/.test(methodName)) continue;
    if (/Mapping$/.test(methodName)) continue;

    const httpMethod = mappingType ? mappingType.toUpperCase() : extractRequestMethod(mappingArgs);
    const methodPath = normalizePath(extractMappingValue(mappingArgs));
    const fullPath = methodPath ? joinPaths(classPath, methodPath) : joinPaths(classPath, '');
    const securityHints = [
      ...extractAnnotations(precedingAnnotations.join(' ') + mappingArgs, /@(PreAuthorize|Secured|RolesAllowed)\s*\(([^)]*)\)/g),
      ...extractAnnotations(content.slice(Math.max(0, annMatch.index - 500), annMatch.index), /@(PreAuthorize|Secured|RolesAllowed)\s*\(([^)]*)\)/g)
    ];
    const validationHints = extractAnnotations(params, /@(Valid|Validated|NotNull|NotBlank|Size|Pattern|Min|Max|Email)\b(?:\(([^)]*)\))?/g);
    const requestBody = params.match(/@RequestBody\s+(?:@Valid\s+)?([A-Za-z0-9_<>]+(?:\.[A-Za-z0-9_<>]+)*)/)?.[1]?.trim();
    const parameters = params.split(',').map(p => p.trim()).filter(Boolean).map(p => p.replace(/\s+/g, ' '));
    const serviceHints = extractServiceHints(content, methodName);

    endpoints.push({
      framework: 'springboot',
      file: rel,
      className,
      methodName,
      httpMethod,
      path: fullPath,
      requestBody,
      parameters,
      securityHints,
      validationHints,
      serviceHints
    });
  }
  return endpoints;
}

function scanJavaDtos(file: string, content: string, root: string): string[] {
  if (!/\b(class|record)\b/.test(content)) return [];
  if (!/@(NotNull|NotBlank|Size|Pattern|Email|Min|Max|Valid)|private\s+[\w<>, ?]+\s+\w+;|\brecord\b/.test(content)) return [];
  const rel = path.relative(root, file);
  const name = content.match(/\b(?:class|record)\s+([A-Za-z0-9_]+)/)?.[1] ?? path.basename(file);
  const fields: string[] = [];

  // 1. Regular class fields: @Annotation private Type name;
  const classFieldRegex = /((?:@\w+(?:\([^)]*\))?\s*)*)private\s+([\w<>, ?]+)\s+(\w+);/g;
  let classMatch: RegExpExecArray | null;
  while ((classMatch = classFieldRegex.exec(content))) {
    const anns = (classMatch[1] ?? '').trim().replace(/\s+/g, ' ');
    fields.push(`- ${classMatch[3]}: ${classMatch[2]}${anns ? ` (${anns})` : ''}`);
    if (fields.length >= 30) break;
  }

  // 2. Record fields: inside record body between balanced parentheses.
  //    Record fields use comma- or paren-terminated inline declarations like "@NotNull String name,"
  //    without the `private` keyword.
  const recordNameRegex = /record\s+(\w+(?:<[^>]+>)?)\s*\(/g;
  let recordMatch: RegExpExecArray | null;
  while ((recordMatch = recordNameRegex.exec(content))) {
    // Find balanced closing paren to extract the record component body
    let depth = 1;
    let i = recordMatch.index + recordMatch[0].length;
    while (i < content.length && depth > 0) {
      if (content[i] === '(') depth++;
      else if (content[i] === ')') depth--;
      i++;
    }
    const recordBody = content.slice(recordMatch.index + recordMatch[0].length, i - 1);
    const recordFieldRegex = /((?:@\w+(?:\([^)]*\))?\s*)*)([\w?]+(?:<[^>]+>)?)\s+(\w+)\s*(?:,|$)/g;
    let rf: RegExpExecArray | null;
    while ((rf = recordFieldRegex.exec(recordBody))) {
      const anns = (rf[1] ?? '').trim().replace(/\s+/g, ' ');
      fields.push(`- ${rf[3]}: ${rf[2]}${anns ? ` (${anns})` : ''}`);
      if (fields.length >= 30) break;
    }
  }

  if (!fields.length) return [];
  return [`### DTO ${name} (${rel})\n${fields.join('\n')}`];
}

function scanPythonApi(file: string, content: string, root: string): ApiEndpointSignal[] {
  const rel = path.relative(root, file);
  const endpoints: ApiEndpointSignal[] = [];
  const fastApiRegex = /@(app|router|api)\.(get|post|put|delete|patch)\s*\(([^)]*)\)\s*\n\s*(?:async\s+)?def\s+(\w+)\s*\(([^)]*)\)/g;
  let match: RegExpExecArray | null;
  while ((match = fastApiRegex.exec(content))) {
    endpoints.push({
      framework: 'fastapi',
      file: rel,
      methodName: match[4],
      httpMethod: match[2].toUpperCase(),
      path: extractPythonPath(match[3]),
      parameters: (match[5] ?? '').split(',').map(p => p.trim()).filter(Boolean),
      securityHints: /Depends\(.*Security|OAuth2|HTTPBearer|current_user/i.test(match[5] ?? '') ? ['FastAPI dependency/security hint detected'] : [],
      validationHints: /BaseModel|Field\(|Query\(|Path\(|Body\(/.test(content) ? ['Pydantic/FastAPI validation hints detected'] : [],
      serviceHints: extractPythonServiceHints(content, match[4])
    });
  }

  const flaskRegex = /@(app|bp|blueprint)\.route\s*\(([^)]*)\)\s*\n\s*def\s+(\w+)\s*\(([^)]*)\)/g;
  while ((match = flaskRegex.exec(content))) {
    endpoints.push({
      framework: 'flask',
      file: rel,
      methodName: match[3],
      httpMethod: extractFlaskMethods(match[2]),
      path: extractPythonPath(match[2]),
      parameters: (match[4] ?? '').split(',').map(p => p.trim()).filter(Boolean),
      securityHints: /login_required|jwt_required|requires_auth/.test(content.slice(Math.max(0, match.index - 500), match.index + 500)) ? ['Flask auth decorator hint detected'] : [],
      validationHints: /schema\.load|marshmallow|pydantic|request\.json/.test(content) ? ['Request body validation hint detected'] : [],
      serviceHints: extractPythonServiceHints(content, match[3])
    });
  }
  return endpoints;
}

function extractMappingValue(args: string): string {
  const m = args.match(/(?:value\s*=\s*|path\s*=\s*)?["']([^"']+)["']/);
  return m?.[1] ?? '';
}

function extractRequestMethod(args: string): string {
  const m = args.match(/RequestMethod\.(GET|POST|PUT|DELETE|PATCH)/);
  return m?.[1] ?? 'REQUEST';
}

function extractPythonPath(args: string): string {
  return args.match(/["']([^"']+)["']/)?.[1] ?? '/';
}

function extractFlaskMethods(args: string): string {
  const m = args.match(/methods\s*=\s*\[([^\]]+)\]/);
  if (!m) return 'GET';
  return m[1].replace(/["'\s]/g, '').replace(/,/g, '|').toUpperCase();
}

function normalizePath(p: string): string {
  if (!p) return '';
  return p.startsWith('/') ? p : `/${p}`;
}

function joinPaths(a: string, b: string): string {
  const left = a && a !== '/' ? a.replace(/\/$/, '') : '';
  const right = b ? normalizePath(b) : '';
  return `${left}${right}` || '/';
}

function extractAnnotations(text: string, regex: RegExp): string[] {
  return [...text.matchAll(regex)].map(m => `${m[1]}${m[2] ? `(${m[2]})` : ''}`).slice(0, 10);
}

function extractServiceHints(content: string, methodName: string): string[] {
  const idx = content.indexOf(methodName);
  const block = idx >= 0 ? content.slice(idx, idx + 1400) : content;
  return [...block.matchAll(/(\w+Service)\.(\w+)\s*\(/g)].map(m => `${m[1]}.${m[2]}()`).slice(0, 10);
}

function extractPythonServiceHints(content: string, methodName: string): string[] {
  const idx = content.indexOf(`def ${methodName}`);
  const block = idx >= 0 ? content.slice(idx, idx + 1400) : content;
  return [...block.matchAll(/(\w+_service|\w+Service)\.(\w+)\s*\(/g)].map(m => `${m[1]}.${m[2]}()`).slice(0, 10);
}

function renderResult(scannedFiles: number, endpoints: ApiEndpointSignal[], dtoHints: string[], warnings: string[]): BackendApiScanResult {
  const lines: string[] = [];
  lines.push(`# Backend API Code Scan\n`);
  lines.push(`- Scanned files: ${scannedFiles}`);
  lines.push(`- Endpoint candidates: ${endpoints.length}`);
  if (warnings.length) {
    lines.push(`\n## Warnings\n${warnings.map(w => `- ${w}`).join('\n')}`);
  }
  if (endpoints.length) {
    lines.push('\n## Endpoint Signals');
    for (const e of endpoints.slice(0, 120)) {
      lines.push(`\n### ${e.httpMethod} ${e.path}`);
      lines.push(`- Framework: ${e.framework}`);
      lines.push(`- File: ${e.file}`);
      if (e.className) lines.push(`- Class: ${e.className}`);
      if (e.methodName) lines.push(`- Handler: ${e.methodName}`);
      if (e.requestBody) lines.push(`- Request body DTO: ${e.requestBody}`);
      if (e.parameters.length) lines.push(`- Parameters:\n${e.parameters.map(p => `  - ${p}`).join('\n')}`);
      if (e.securityHints.length) lines.push(`- Security hints: ${e.securityHints.join('; ')}`);
      if (e.validationHints.length) lines.push(`- Validation hints: ${e.validationHints.join('; ')}`);
      if (e.serviceHints.length) lines.push(`- Service calls: ${e.serviceHints.join('; ')}`);
    }
  } else {
    lines.push('\n## Endpoint Signals\nNo endpoints were found. Attach Controller/router files or open a backend workspace.');
  }
  if (dtoHints.length) {
    lines.push(`\n## DTO / Request Model Hints\n${dtoHints.join('\n\n')}`);
  }
  return { scannedFiles, endpoints, dtoHints, warnings, markdown: lines.join('\n') };
}
