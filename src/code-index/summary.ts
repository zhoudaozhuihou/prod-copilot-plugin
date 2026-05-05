/**
 * Renders the code index into a compact LLM context pack.
 *
 * The summary is the key output that gets injected into command prompts.
 * It provides a structural overview of the project without re-reading every file.
 * Format: Markdown with categorized sections, compact enough to fit in context.
 *
 * Target summary size: ~2000-4000 characters for a medium project (200 files).
 * This replaces the need to walk and scan the repo on every command invocation.
 */

import type { FileCacheEntry } from './types';

/**
 * Render a compact summary of the codebase for LLM context injection.
 *
 * @param files - Array of file cache entries (the current index)
 * @param workspaceRoot - Workspace root path for relative path resolution
 * @returns Markdown-formatted summary string
 */
export function renderSummary(files: FileCacheEntry[], workspaceRoot: string): string {
  const lines: string[] = [];

  // --- Section 1: Overview ---
  const totalEntities = files.reduce((sum, f) => sum + f.entities.length, 0);
  lines.push(`## 📋 Codebase Snapshot`);
  lines.push(`- Files indexed: ${files.length}`);
  lines.push(`- Entities extracted: ${totalEntities}`);
  lines.push('');

  // --- Section 2: File structure by language (compact) ---
  const byLang = groupBy(files, f => f.language);
  const langSummary = Object.entries(byLang)
    .sort(([, a], [, b]) => b.length - a.length)
    .map(([lang, list]) => `${list.length} ${lang}`)
    .join(', ');
  lines.push(`### Languages: ${langSummary}`);
  lines.push('');

  // --- Section 3: Top-level modules (first 2 directory levels) ---
  const dirs = new Set<string>();
  for (const f of files) {
    const rel = relativeDir(workspaceRoot, f.filePath);
    if (rel) dirs.add(rel);
  }
  const sortedDirs = Array.from(dirs).sort();
  lines.push('### Directory Structure');
  // Only show top 2 levels
  const topLevel = new Set(sortedDirs.map(d => d.split('/')[0]).filter(Boolean));
  for (const d of Array.from(topLevel).sort()) {
    const subFiles = files.filter(f => f.filePath.includes(`/${d}/`) || f.filePath.includes(`\\${d}\\`));
    const subCount = subFiles.length;
    const langs = new Set(subFiles.map(f => f.language));
    const routeCount = subFiles.reduce((s, f) => s + f.entities.filter(e => e.kind === 'route').length, 0);
    lines.push(`- \`${d}/\` (${subCount} files, langs: ${Array.from(langs).join(', ')}${routeCount > 0 ? `, routes: ${routeCount}` : ''})`);
  }
  lines.push('');

  // --- Section 4: Key structural entities by category ---
  const allEntities = files.flatMap(f => f.entities);

  // Controllers
  const controllers = allEntities.filter(e => e.kind === 'controller');
  if (controllers.length > 0) {
    lines.push(`### Controllers (${controllers.length})`);
    for (const c of controllers.slice(0, 20)) {
      const rel = relativePath(workspaceRoot, c.filePath);
      lines.push(`- \`${c.name}\` (${rel})`);
    }
    lines.push('');
  }

  // Routes/Endpoints
  const routes = allEntities.filter(e => e.kind === 'route');
  if (routes.length > 0) {
    lines.push(`### API Routes (${routes.length})`);
    for (const r of routes.slice(0, 30)) {
      const rel = relativePath(workspaceRoot, r.filePath);
      lines.push(`- \`${r.routeMethod || '?'} ${r.routePath || r.name}\` (${rel})`);
    }
    lines.push('');
  }

  // Services
  const services = allEntities.filter(e => e.kind === 'service');
  if (services.length > 0) {
    lines.push(`### Services (${services.length})`);
    for (const s of services.slice(0, 20)) {
      const rel = relativePath(workspaceRoot, s.filePath);
      lines.push(`- \`${s.name}\` (${rel})`);
    }
    lines.push('');
  }

  // DTOs / Models
  const dtos = allEntities.filter(e => e.kind === 'dto');
  if (dtos.length > 0) {
    lines.push(`### DTOs / Models (${dtos.length})`);
    for (const d of dtos.slice(0, 20)) {
      const rel = relativePath(workspaceRoot, d.filePath);
      lines.push(`- \`${d.name}\` (${rel})`);
    }
    lines.push('');
  }

  // Classes (top-level, non-DTO, non-controller)
  const classes = allEntities.filter(e => e.kind === 'class' || e.kind === 'interface' || e.kind === 'enum' || e.kind === 'record');
  if (classes.length > 0) {
    lines.push(`### Classes / Interfaces / Enums (${classes.length})`);
    // Group by parent directory for readability
    const byDir = groupBy(classes, e => {
      const rel = relativePath(workspaceRoot, e.filePath);
      return rel.split('/').slice(0, -1).join('/') || '(root)';
    });
    for (const [dir, ents] of Object.entries(byDir).sort()) {
      const names = ents.slice(0, 10).map(e => `\`${e.name}\``).join(', ');
      lines.push(`- \`${dir}/\`: ${names}${ents.length > 10 ? ` +${ents.length - 10} more` : ''}`);
    }
    lines.push('');
  }

  // SQL tables / views
  const sqlEntities = allEntities.filter(e => e.kind === 'sql_table' || e.kind === 'sql_view');
  if (sqlEntities.length > 0) {
    lines.push(`### SQL Tables / Views (${sqlEntities.length})`);
    const byDir = groupBy(sqlEntities, e => {
      const rel = relativePath(workspaceRoot, e.filePath);
      return rel.split('/').slice(0, -1).join('/') || '(root)';
    });
    for (const [dir, ents] of Object.entries(byDir).sort()) {
      const names = ents.slice(0, 8).map(e => `\`${e.name}\``).join(', ');
      lines.push(`- \`${dir}/\`: ${names}${ents.length > 8 ? ` +${ents.length - 8} more` : ''}`);
    }
    lines.push('');
  }

  // Tests
  const tests = files.filter(f => isTestFile(f.filePath));
  if (tests.length > 0) {
    const testEntities = tests.flatMap(f => f.entities);
    const testFuncs = testEntities.filter(e => e.kind === 'function');
    lines.push(`### Tests (${tests.length} files, ${testFuncs.length} test functions)`);
    lines.push('');
  }

  // --- Section 5: Key files for the current task context (always include) ---
  lines.push(`> Index built at: ${new Date().toISOString()}`);
  lines.push(`> Use this snapshot to understand project structure without re-reading every file.`);

  return lines.join('\n').slice(0, 8000);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativePath(root: string, absPath: string): string {
  try {
    const rel = absPath.startsWith(root) ? absPath.slice(root.length + 1) : absPath;
    return rel.replace(/\\/g, '/');
  } catch {
    return absPath;
  }
}

function relativeDir(root: string, absPath: string): string {
  const rel = relativePath(root, absPath);
  const idx = rel.lastIndexOf('/');
  return idx > 0 ? rel.slice(0, idx) : '';
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

function isTestFile(filePath: string): boolean {
  const lower = filePath.toLowerCase();
  return lower.includes('test') || lower.includes('spec') || lower.includes('__tests__') || lower.endsWith('.test.ts') || lower.endsWith('.spec.ts');
}
