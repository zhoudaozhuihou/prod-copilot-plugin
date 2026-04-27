/**
 * Product Dev Copilot Source Note
 *
 * File: src/commands/loop.command.ts
 * Purpose: Command handler for @loop. Delegates to the shared AI artifact pipeline or performs local workflow actions.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import * as vscode from 'vscode';
import { CommandArgs, CommandResult } from '../core/types';
import { createLoopState, renderLoopStatus } from '../loop/ralph-loop';
import { runLoopNextCommand } from './loop-next.command';

export async function runLoopCommand(args: CommandArgs): Promise<CommandResult> {
  const cfg = vscode.workspace.getConfiguration('companyProductDev');
  const maxIterations = Number(cfg.get('ralphMaxIterations') ?? 6);
  const autoRun = Boolean(cfg.get('ralphAutoRun') ?? false);
  const task = args.userPrompt?.trim() || 'Run the ordered product development workflow for the current repository.';
  const state = await createLoopState(task, maxIterations, autoRun ? 'auto' : 'guided');
  args.stream.markdown(`${renderLoopStatus(state)}\n\n`);

  if (!autoRun) {
    args.stream.markdown('Guided mode is enabled. I will execute the first safe iteration now; run `@product-dev /loop-next` to continue the next iteration.\n\n');
    return runLoopNextCommand(args);
  }

  let lastResult: CommandResult = { title: 'Ralph Loop', markdown: renderLoopStatus(state), artifactPath: '.product-dev/ralph-loop.local.json' };
  for (let i = 0; i < maxIterations; i += 1) {
    if (args.token.isCancellationRequested) break;
    lastResult = await runLoopNextCommand(args);
  }
  return lastResult;
}
