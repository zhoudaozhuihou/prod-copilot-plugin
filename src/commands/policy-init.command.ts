/**
 * Product Dev Copilot Source Note
 *
 * File: src/commands/policy-init.command.ts
 * Purpose: Command handler for @policy-init. Delegates to the shared AI artifact pipeline or performs local workflow actions.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import { CommandArgs, CommandResult } from '../core/types';
import { getWorkspaceRoot } from '../context/workspace';
import { initializePolicyPacks } from '../policies/policy-pack-initializer';

export async function runPolicyInitCommand(args: CommandArgs): Promise<CommandResult> {
  const root = getWorkspaceRoot();
  args.stream.progress('Creating local policy pack folders and templates...');
  const result = await initializePolicyPacks(root);
  args.stream.markdown(result.markdown);
  return {
    title: 'Policy Pack Initialization Report',
    markdown: result.markdown,
    artifactPath: result.intakeFile,
    nextStepHint: 'Next recommended command: `@product-dev /policy-intake` — answer which company, department, country, project, and environment rules apply.'
  };
}
