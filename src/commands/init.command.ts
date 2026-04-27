/**
 * Product Dev Copilot Source Note
 *
 * File: src/commands/init.command.ts
 * Purpose: Command handler for @init. Delegates to the shared AI artifact pipeline or performs local workflow actions.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import { CommandArgs, CommandResult } from '../core/types';
import { getWorkspaceRoot } from '../context/workspace';
import { initializeProjectScaffold } from '../scaffold/project-initializer';
import { optimizeUserInput, renderOptimizedUserInput } from '../prompt/user-input-optimizer';

export async function runInitCommand(args: CommandArgs): Promise<CommandResult> {
  const root = getWorkspaceRoot();
  const optimized = optimizeUserInput('init', args.userPrompt, undefined, args.requestContext);
  args.stream.progress('Creating stack-driven scaffold, Copilot/opencode assets, policy packs, and intake files...');
  const result = await initializeProjectScaffold(root, args.userPrompt);
  args.stream.markdown(result.markdown);
  args.stream.markdown(`\n\n---\n\n## Prompt Optimization Applied\n\n${renderOptimizedUserInput(optimized)}\n`);

  return {
    title: 'Interactive Project Initialization Report',
    markdown: result.markdown,
    artifactPath: result.questionFile,
    nextStepHint: 'Next recommended command: `@product-dev /intake` if any stack/background decisions are missing, otherwise `@product-dev /policy-intake`.'
  };
}
