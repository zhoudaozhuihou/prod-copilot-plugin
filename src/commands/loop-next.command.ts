/**
 * Product Dev Copilot Source Note
 *
 * File: src/commands/loop-next.command.ts
 * Purpose: Command handler for @loop-next. Delegates to the shared AI artifact pipeline or performs local workflow actions.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import { CommandArgs, CommandResult } from '../core/types';
import { getNextPendingCommand, loadLoopState, markIterationComplete, renderLoopStatus } from '../loop/ralph-loop';
import { runAiArtifactCommand, streamResult } from './shared';

export async function runLoopNextCommand(args: CommandArgs): Promise<CommandResult> {
  const state = await loadLoopState();
  if (!state) {
    const markdown = '# Ralph Loop Next\n\nNo loop state found. Start one with `@product-dev /loop <task>`.\n';
    args.stream.markdown(markdown);
    return { title: 'Ralph Loop Next', markdown };
  }
  const next = getNextPendingCommand(state);
  if (!next) {
    const markdown = renderLoopStatus(state) + '\n\nNo pending command remains or max iterations has been reached.\n';
    args.stream.markdown(markdown);
    return { title: 'Ralph Loop Next', markdown, artifactPath: '.product-dev/ralph-loop.local.json' };
  }

  args.stream.markdown(`## Ralph Loop Iteration ${state.iteration + 1}/${state.maxIterations}\n\nExecuting next command: \`/${next}\`\n\n`);
  const result = await runAiArtifactCommand({
    ...args,
    command: next,
    userPrompt: `${state.task}\n\nRalph loop context: continue the ordered loop. Completed commands: ${state.completed.map(c => `/${c}`).join(', ') || 'none'}.`
  }, next);
  streamResult(args, result);
  const updated = await markIterationComplete(state, next, `Generated ${result.artifactPath ?? result.title}.`);
  args.stream.markdown(`\n\n---\n\n${renderLoopStatus(updated)}`);
  return { ...result, title: `Ralph Loop Iteration: ${result.title}`, artifactPath: result.artifactPath };
}
