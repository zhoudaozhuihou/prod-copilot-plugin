/**
 * Product Dev Copilot Source Note
 *
 * File: src/commands/policy-scan.command.ts
 * Purpose: Command handler for @policy-scan. Delegates to the shared AI artifact pipeline or performs local workflow actions.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import { CommandArgs, CommandResult } from '../core/types';
import { getWorkspaceRoot } from '../context/workspace';
import { loadProductDevConfig } from '../context/config-loader';
import { loadPolicyPackContext, buildPolicyInventoryMarkdown } from '../policies/policy-pack-loader';
import { writeArtifact } from '../writers/artifact-writer';
import { scanRepository } from '../context/repo-scanner';

export async function runPolicyScanCommand(args: CommandArgs): Promise<CommandResult> {
  const root = getWorkspaceRoot();
  args.stream.progress('Scanning local policy pack folders...');
  const config = await loadProductDevConfig(root);
  const policy = await loadPolicyPackContext(root, config);
  const markdown = buildPolicyInventoryMarkdown(policy);
  const repo = await scanRepository(root);
  const artifactPath = await writeArtifact(repo, 'policy/policy-pack-scan.md', markdown);
  args.stream.markdown(markdown);
  return {
    title: 'Policy Pack Scan Report',
    markdown,
    artifactPath,
    nextStepHint: 'Next recommended command: `@product-dev /policy-review` — review policy gaps, conflicts, and workflow applicability.'
  };
}
