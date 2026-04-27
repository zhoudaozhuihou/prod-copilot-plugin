/**
 * Command handler for @prd-json.
 *
 * Ralph-related commands use the shared AI artifact pipeline so they receive
 * user-input optimization, attachment context, Policy Pack context, portable
 * prompt resources, and custom skills.
 */

import { CommandArgs, CommandResult } from '../core/types';
import { runAiArtifactCommand, streamResult } from './shared';

export async function runPrdJsonCommand(args: CommandArgs): Promise<CommandResult> {
  const result = await runAiArtifactCommand(args, 'prd-json');
  streamResult(args, result);
  return result;
}
