/**
 * Product Dev Copilot Source Note
 *
 * File: src/utils/fs-utils.ts
 * Purpose: File-system helper utilities used by scanners, scaffolders, and writers.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function readTextIfExists(filePath: string): Promise<string | undefined> {
  if (!(await exists(filePath))) {
    return undefined;
  }
  return fs.readFile(filePath, 'utf8');
}

export function normalizePath(p: string): string {
  return p.split(path.sep).join('/');
}

export function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }
  return `${text.slice(0, maxChars)}\n\n...[truncated ${text.length - maxChars} chars]`;
}
