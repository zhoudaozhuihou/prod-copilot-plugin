/**
 * Command handler for @ralph-readiness.
 *
 * Ralph-related commands use the shared AI artifact pipeline so they receive
 * user-input optimization, attachment context, Policy Pack context, portable
 * prompt resources, and custom skills.
 */

import { CommandArgs, CommandResult } from '../core/types';
import { runAiArtifactCommand, streamResult } from './shared';

export async function runRalphReadinessCommand(args: CommandArgs): Promise<CommandResult> {
  const result = await runAiArtifactCommand(args, 'ralph-readiness');
  streamResult(args, result);
  return result;
}
