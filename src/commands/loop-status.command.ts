/**
 * Product Dev Copilot Source Note
 *
 * File: src/commands/loop-status.command.ts
 * Purpose: Command handler for @loop-status. Delegates to the shared AI artifact pipeline or performs local workflow actions.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import { CommandArgs, CommandResult } from '../core/types';
import { loadLoopState, renderLoopStatus } from '../loop/ralph-loop';

export async function runLoopStatusCommand(args: CommandArgs): Promise<CommandResult> {
  const state = await loadLoopState();
  const markdown = state ? renderLoopStatus(state) : '# Ralph Loop Status\n\nNo active loop state found. Start one with `@product-dev /loop <task>`.\n';
  args.stream.markdown(markdown);
  return { title: 'Ralph Loop Status', markdown, artifactPath: '.product-dev/ralph-loop.local.json' };
}
