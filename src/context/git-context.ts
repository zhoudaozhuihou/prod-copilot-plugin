/**
 * Product Dev Copilot Source Note
 *
 * File: src/context/git-context.ts
 * Purpose: Git context reader. Captures branch, status, and diff for review/diff/release commands.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { GitContext } from '../core/types';
import { truncate } from '../utils/fs-utils';

const execFileAsync = promisify(execFile);

export async function readGitContext(workspaceRoot: string): Promise<GitContext> {
  const [branch, status, diff, lastCommit] = await Promise.all([
    runGit(workspaceRoot, ['rev-parse', '--abbrev-ref', 'HEAD']),
    runGit(workspaceRoot, ['status', '--short']),
    runGit(workspaceRoot, ['diff', '--stat', 'HEAD']).then(async stat => {
      const full = await runGit(workspaceRoot, ['diff', 'HEAD']);
      return `${stat}\n\n${truncate(full, 25_000)}`;
    }),
    runGit(workspaceRoot, ['log', '-1', '--pretty=%h %s'])
  ]);

  return {
    branch: branch.trim() || undefined,
    status: status.trim() || undefined,
    diff: diff.trim() || undefined,
    lastCommit: lastCommit.trim() || undefined
  };
}

async function runGit(cwd: string, args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync('git', args, { cwd, timeout: 10_000, maxBuffer: 2_000_000 });
    return stdout;
  } catch {
    return '';
  }
}
