/**
 * Product Dev Copilot Source Note
 *
 * File: src/commands/loop-stop.command.ts
 * Purpose: Command handler for @loop-stop. Delegates to the shared AI artifact pipeline or performs local workflow actions.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import { CommandArgs, CommandResult } from '../core/types';
import { renderLoopStatus, stopLoopState } from '../loop/ralph-loop';

export async function runLoopStopCommand(args: CommandArgs): Promise<CommandResult> {
  const state = await stopLoopState('Stopped by @product-dev /loop-stop.');
  const markdown = state ? renderLoopStatus(state) : '# Ralph Loop Stop\n\nNo active loop state found.\n';
  args.stream.markdown(markdown);
  return { title: 'Ralph Loop Stop', markdown, artifactPath: '.product-dev/ralph-loop.local.json' };
}
