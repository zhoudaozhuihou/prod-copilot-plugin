/**
 * Product Dev Copilot Source Note
 *
 * File: src/commands/scan.command.ts
 * Purpose: Command handler for @scan. Delegates to the shared AI artifact pipeline or performs local workflow actions.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import { CommandArgs, CommandResult } from '../core/types';
import { scanRepository, writeRepoMap, renderRepoMap } from '../context/repo-scanner';
import { getWorkspaceRoot } from '../context/workspace';

export async function runScanCommand(args: CommandArgs): Promise<CommandResult> {
  args.stream.progress('Scanning repository...');
  const repo = await scanRepository(getWorkspaceRoot());
  const artifactPath = await writeRepoMap(repo);
  const markdown = renderRepoMap(repo);
  args.stream.markdown(`# Repository Scan Report\n\n✅ Artifact written: \`${artifactPath}\`\n\n${markdown}`);
  return { title: 'Repository Scan Report', markdown, artifactPath };
}
