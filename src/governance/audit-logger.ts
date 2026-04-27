/**
 * Product Dev Copilot Source Note
 *
 * File: src/governance/audit-logger.ts
 * Purpose: Audit logging helper for enterprise governance evidence.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ensureDir } from '../utils/fs-utils';

export async function appendAuditLog(workspaceRoot: string, event: Record<string, unknown>): Promise<void> {
  const dir = path.join(workspaceRoot, '.product-dev');
  await ensureDir(dir);
  const line = JSON.stringify({ ts: new Date().toISOString(), ...event });
  await fs.appendFile(path.join(dir, 'audit.log'), `${line}\n`, 'utf8');
}
