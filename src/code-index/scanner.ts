/**
 * Regex-based lightweight code scanner.
 *
 * Scans individual source files and extracts structural entities
 * (classes, functions, interfaces, routes, DTOs, SQL tables) without
 * requiring a full AST parser like Tree-sitter.
 *
 * This is intentionally simpler than code-review-graph's Tree-sitter
 * approach — it uses regex heuristics tuned for common frameworks
 * (Spring Boot, FastAPI, React/Next.js, TypeScript, SQL DDL).
 */

import type { CodeEntity, CodeLanguage } from './types';
import * as path from 'path';

/**
 * Detect language from file extension.
 */
export function detectLanguage(filePath: string): CodeLanguage {
  const ext = path.extname(filePath).toLowerCase();
  const langMap: Record<string, CodeLanguage> = {
    '.ts': 'typescript', '.tsx': 'typescript', '.mts': 'typescript', '.cts': 'typescript',
    '.js': 'javascript', '.jsx': 'javascript', '.mjs': 'javascript', '.cjs': 'javascript',
    '.java': 'java',
    '.py': 'python',
    '.sql': 'sql', '.ddl': 'sql', '.dml': 'sql',
    '.go': 'go',
    '.rs': 'rust',
    '.yaml': 'yaml', '.yml': 'yaml',
    '.json': 'json',
    '.md': 'markdown',
    '.css': 'css', '.scss': 'css', '.less': 'css',
    '.html': 'html', '.htm': 'html',
    '.kt': 'java', '.kts': 'java',
    '.xml': 'markdown',
    '.properties': 'unknown', '.env': 'unknown', '.sh': 'unknown',
  };
  return langMap[ext] || 'unknown';
}

/**
 * Scan a single file's content and extract structural entities.
 */
export function scanFile(filePath: string, content: string, language: CodeLanguage): CodeEntity[] {
  const entities: CodeEntity[] = [];

  switch (language) {
    case 'typescript':
    case 'javascript':
      entities.push(...scanTypeScript(filePath, content, language));
      break;
    case 'java':
      entities.push(...scanJava(filePath, content));
      break;
    case 'python':
      entities.push(...scanPython(filePath, content));
      break;
    case 'sql':
      entities.push(...scanSql(filePath, content));
      break;
    case 'go':
      entities.push(...scanGo(filePath, content));
      break;
    default:
      // Unknown language — minimal scan for class/function patterns
      entities.push(...scanGeneric(filePath, content, language));
      break;
  }

  return entities;
}

// ---------------------------------------------------------------------------
// TypeScript / JavaScript scanner
// ---------------------------------------------------------------------------

function scanTypeScript(filePath: string, content: string, language: CodeLanguage): CodeEntity[] {
  const entities: CodeEntity[] = [];

  // Class declarations (including export default class)
  const classRe = /(?:export\s+(?:default\s+)?)?(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?/g;
  let m: RegExpExecArray | null;
  while ((m = classRe.exec(content)) !== null) {
    const lineStart = lineNumber(content, m.index);
    entities.push({
      kind: 'class', name: m[1], qualifiedName: m[1],
      filePath, lineStart, lineEnd: lineStart,
      language, modifiers: extractModifiers(content, m.index),
    } as CodeEntity);
  }

  // Interface declarations
  const ifaceRe = /(?:export\s+(?:default\s+)?)?interface\s+(\w+)(?:\s+extends\s+([^{]+))?/g;
  while ((m = ifaceRe.exec(content)) !== null) {
    const lineStart = lineNumber(content, m.index);
    entities.push({
      kind: 'interface', name: m[1], qualifiedName: m[1],
      filePath, lineStart, lineEnd: lineStart,
      language,
    } as CodeEntity);
  }

  // Enum declarations
  const enumRe = /(?:export\s+(?:default\s+)?)?enum\s+(\w+)/g;
  while ((m = enumRe.exec(content)) !== null) {
    entities.push({
      kind: 'enum', name: m[1], qualifiedName: m[1],
      filePath, lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
      language,
    } as CodeEntity);
  }

  // Function declarations (top-level or export)
  const funcRe = /(?:export\s+(?:default\s+)?)?(?:async\s+)?function\s+(\w+)\s*\(/g;
  while ((m = funcRe.exec(content)) !== null) {
    entities.push({
      kind: 'function', name: m[1], qualifiedName: m[1],
      filePath, lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
      language,
    } as CodeEntity);
  }

  // Arrow function exports (export const foo = (...)
  const arrowRe = /export\s+(?:const|let|var)\s+(\w+)\s*=\s*(?:(?:async\s+)?\(|(?:async\s+)?\w+\s*=>)/g;
  while ((m = arrowRe.exec(content)) !== null) {
    entities.push({
      kind: 'function', name: m[1], qualifiedName: m[1],
      filePath, lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
      language,
    } as CodeEntity);
  }

  // Route detection (Express / Next.js API routes)
  const routeRe = /(?:router|app)\s*\.\s*(get|post|put|delete|patch|all)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
  while ((m = routeRe.exec(content)) !== null) {
    entities.push({
      kind: 'route', name: `${m[1].toUpperCase()} ${m[2]}`,
      qualifiedName: `${m[1].toUpperCase()} ${m[2]}`, filePath,
      lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
      language, routeMethod: m[1].toUpperCase(), routePath: m[2],
    } as CodeEntity);
  }

  // React component detection (PascalCase function returning JSX)
  const componentRe = /(?:export\s+(?:default\s+)?)?(?:const\s+)?(\w+)\s*(?::\s*[^(=]+)?\s*=\s*(?:\([^)]*\)\s*=>|React\.memo\()/g;
  while ((m = componentRe.exec(content)) !== null) {
    if (/^[A-Z]/.test(m[1])) {
      entities.push({
        kind: 'function', name: m[1], qualifiedName: m[1],
        filePath, lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
        language,
      } as CodeEntity);
    }
  }

  // Imports
  const importRe = /(?:import\s+(?:\{[^}]*\}\s+from\s+)?['"`][^'"`]+['"`]|import\s+(\w+)\s+from\s+['"`][^'"`]+['"`])/g;
  while ((m = importRe.exec(content)) !== null) {
    // import tracking is done at the file level — we add an entity for the file itself
  }

  return deduplicate(entities);
}

// ---------------------------------------------------------------------------
// Java / Spring Boot scanner
// ---------------------------------------------------------------------------

function scanJava(filePath: string, content: string): CodeEntity[] {
  const entities: CodeEntity[] = [];
  const language: CodeLanguage = 'java';

  // Class / interface / enum / record declarations
  const classRe = /(?:public\s+|private\s+|protected\s+)?(?:abstract\s+|final\s+)?(?:class|interface|enum|record)\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?/g;
  let m: RegExpExecArray | null;
  while ((m = classRe.exec(content)) !== null) {
    entities.push({
      kind: m[0].includes('interface') ? 'interface' : m[0].includes('enum') ? 'enum' : m[0].includes('record') ? 'record' : 'class',
      name: m[1], qualifiedName: m[1], filePath,
      lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
      language,
    } as CodeEntity);
  }

  // Controller detection (@RestController / @Controller)
  if (/@(Rest)?Controller/.test(content)) {
    const ctrlName = content.match(/(?:public\s+)?(?:class|record)\s+(\w+)/)?.[1] || 'unknown';
    entities.push({
      kind: 'controller', name: ctrlName, qualifiedName: ctrlName, filePath,
      lineStart: 1, lineEnd: 1, language,
    } as CodeEntity);
  }

  // Spring Boot route mappings
  const routeRe = /@(Get|Post|Put|Delete|Patch)Mapping\s*\(\s*["']([^"']+)["']/g;
  while ((m = routeRe.exec(content)) !== null) {
    entities.push({
      kind: 'route', name: `${m[1].toUpperCase()} ${m[2]}`,
      qualifiedName: `${m[1].toUpperCase()} ${m[2]}`, filePath,
      lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
      language, routeMethod: m[1].toUpperCase(), routePath: m[2],
    } as CodeEntity);
  }

  // @RequestMapping on methods
  const reqMapRe = /@RequestMapping\s*\(\s*(?:method\s*=\s*(?:RequestMethod\.)?(\w+)\s*,\s*)?(?:path\s*=\s*)?["']([^"']+)["']/g;
  while ((m = reqMapRe.exec(content)) !== null) {
    entities.push({
      kind: 'route', name: `${(m[1] || 'REQUEST').toUpperCase()} ${m[2]}`,
      qualifiedName: `${(m[1] || 'REQUEST').toUpperCase()} ${m[2]}`, filePath,
      lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
      language, routeMethod: (m[1] || 'REQUEST').toUpperCase(), routePath: m[2],
    } as CodeEntity);
  }

  // DTO / model detection (class with Bean Validation annotations)
  const dtoRe = /@(?:Data|Value|Builder|AllArgsConstructor|NoArgsConstructor|Getter|Setter)\s*\n\s*(?:public\s+)?(?:class|record)\s+(\w+)/g;
  while ((m = dtoRe.exec(content)) !== null) {
    entities.push({
      kind: 'dto', name: m[1], qualifiedName: m[1], filePath,
      lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
      language,
    } as CodeEntity);
  }

  // Service detection (class with @Service or Service suffix)
  const svcRe = /@Service\s*\n\s*(?:public\s+)?(?:class|interface)\s+(\w+Service)/g;
  while ((m = svcRe.exec(content)) !== null) {
    entities.push({
      kind: 'service', name: m[1], qualifiedName: m[1], filePath,
      lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
      language,
    } as CodeEntity);
  }

  // Repository detection
  const repoRe = /@Repository\s*\n\s*(?:public\s+)?(?:interface|class)\s+(\w+(?:Repository|Repo))/g;
  while ((m = repoRe.exec(content)) !== null) {
    entities.push({
      kind: 'repository', name: m[1], qualifiedName: m[1], filePath,
      lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
      language,
    } as CodeEntity);
  }

  return deduplicate(entities);
}

// ---------------------------------------------------------------------------
// Python / FastAPI / Flask scanner
// ---------------------------------------------------------------------------

function scanPython(filePath: string, content: string): CodeEntity[] {
  const entities: CodeEntity[] = [];
  const language: CodeLanguage = 'python';

  // Class definitions
  const classRe = /class\s+(\w+)(?:\(([^)]*)\))?:/g;
  let m: RegExpExecArray | null;
  while ((m = classRe.exec(content)) !== null) {
    entities.push({
      kind: 'class', name: m[1], qualifiedName: m[1], filePath,
      lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
      language,
    } as CodeEntity);
  }

  // Top-level function definitions
  const funcRe = /(?:async\s+)?def\s+(\w+)\s*\(/g;
  while ((m = funcRecover(content, funcRe)) !== null) {
    entities.push({
      kind: 'function', name: m[1], qualifiedName: m[1], filePath,
      lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
      language,
    } as CodeEntity);
  }

  // FastAPI route decorators
  const fastApiRe = /@(?:app|router|api)\.(get|post|put|delete|patch)\s*\(\s*["']([^"']+)["']/g;
  while ((m = fastApiRe.exec(content)) !== null) {
    entities.push({
      kind: 'route', name: `${m[1].toUpperCase()} ${m[2]}`,
      qualifiedName: `${m[1].toUpperCase()} ${m[2]}`, filePath,
      lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
      language, routeMethod: m[1].toUpperCase(), routePath: m[2],
    } as CodeEntity);
  }

  // Flask route decorators
  const flaskRe = /@(?:app|bp|blueprint)\.route\s*\(\s*["']([^"']+)["']/g;
  while ((m = flaskRe.exec(content)) !== null) {
    entities.push({
      kind: 'route', name: `GET ${m[1]}`, qualifiedName: `GET ${m[1]}`, filePath,
      lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
      language, routeMethod: 'GET', routePath: m[1],
    } as CodeEntity);
  }

  // Pydantic model detection
  if (/BaseModel|pydantic/.test(content)) {
    const modelRe = /class\s+(\w+(?:Model|Schema|Request|Response))\s*\(/g;
    while ((m = modelRe.exec(content)) !== null) {
      entities.push({
        kind: 'dto', name: m[1], qualifiedName: m[1], filePath,
        lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
        language,
      } as CodeEntity);
    }
  }

  return deduplicate(entities);
}

// Helper for recovery of funcRe across content
function funcRecover(content: string, re: RegExp): RegExpExecArray | null {
  return re.exec(content);
}

// ---------------------------------------------------------------------------
// SQL scanner (DDL + DML)
// ---------------------------------------------------------------------------

function scanSql(filePath: string, content: string): CodeEntity[] {
  const entities: CodeEntity[] = [];
  const language: CodeLanguage = 'sql';

  // CREATE TABLE / VIEW
  const tableRe = /CREATE\s+(?:OR\s+REPLACE\s+)?(?:TABLE|VIEW)\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`?(\w+)`?\.)?`?(\w+)`?/gi;
  let m: RegExpExecArray | null;
  while ((m = tableRe.exec(content)) !== null) {
    const tableName = m[2] || m[1];
    const isView = m[0].toUpperCase().includes('VIEW');
    entities.push({
      kind: isView ? 'sql_view' : 'sql_table', name: tableName, qualifiedName: tableName, filePath,
      lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
      language,
    } as CodeEntity);
  }

  // INSERT INTO / MERGE INTO targets
  const targetRe = /(?:INSERT\s+(?:INTO|OVERWRITE\s+TABLE)\s+|MERGE\s+INTO\s+)(?:`?(\w+)`?\.)?`?(\w+)`?/gi;
  while ((m = targetRe.exec(content)) !== null) {
    entities.push({
      kind: 'sql_table', name: m[2] || m[1], qualifiedName: m[2] || m[1], filePath,
      lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
      language,
    } as CodeEntity);
  }

  return deduplicate(entities);
}

// ---------------------------------------------------------------------------
// Go scanner
// ---------------------------------------------------------------------------

function scanGo(filePath: string, content: string): CodeEntity[] {
  const entities: CodeEntity[] = [];
  const language: CodeLanguage = 'go';

  // Type declarations (struct, interface)
  const typeRe = /type\s+(\w+)\s+(struct|interface)\b/g;
  let m: RegExpExecArray | null;
  while ((m = typeRe.exec(content)) !== null) {
    entities.push({
      kind: m[2] === 'interface' ? 'interface' : 'class',
      name: m[1], qualifiedName: m[1], filePath,
      lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
      language,
    } as CodeEntity);
  }

  // Function declarations
  const funcRe = /func\s+(?:\([^)]*\)\s+)?(\w+)\s*\(/g;
  while ((m = funcRe.exec(content)) !== null) {
    entities.push({
      kind: 'function', name: m[1], qualifiedName: m[1], filePath,
      lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
      language,
    } as CodeEntity);
  }

  return deduplicate(entities);
}

// ---------------------------------------------------------------------------
// Generic language scanner (fallback)
// ---------------------------------------------------------------------------

function scanGeneric(filePath: string, content: string, language: CodeLanguage): CodeEntity[] {
  const entities: CodeEntity[] = [];

  // Basic class/function/interface patterns
  const classRe = /(?:class|struct|trait)\s+(\w+)/g;
  let m: RegExpExecArray | null;
  while ((m = classRe.exec(content)) !== null) {
    entities.push({
      kind: 'class', name: m[1], qualifiedName: m[1], filePath,
      lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
      language,
    } as CodeEntity);
  }

  const funcRe = /(?:fn|def|function|func)\s+(\w+)\s*\(/g;
  while ((m = funcRe.exec(content)) !== null) {
    entities.push({
      kind: 'function', name: m[1], qualifiedName: m[1], filePath,
      lineStart: lineNumber(content, m.index), lineEnd: lineNumber(content, m.index),
      language,
    } as CodeEntity);
  }

  return deduplicate(entities);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lineNumber(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

function extractModifiers(content: string, index: number): string[] {
  const before = content.slice(Math.max(0, index - 200), index);
  const mods: string[] = [];
  if (/export\b/.test(before)) mods.push('export');
  if (/abstract\b/.test(before)) mods.push('abstract');
  if (/default\b/.test(before)) mods.push('default');
  return mods;
}

function deduplicate(entities: CodeEntity[]): CodeEntity[] {
  const seen = new Set<string>();
  return entities.filter(e => {
    const key = `${e.kind}:${e.qualifiedName}:${e.lineStart}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Test helper to expose scan functions for testing.
 */
export const TEST_HOOKS = {
  scanTypeScript,
  scanJava,
  scanPython,
  scanSql,
  scanGo,
};
