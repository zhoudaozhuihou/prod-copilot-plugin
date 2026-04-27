/**
 * Command handler for @story-split.
 *
 * Ralph-related commands use the shared AI artifact pipeline so they receive
 * user-input optimization, attachment context, Policy Pack context, portable
 * prompt resources, and custom skills.
 */

import { CommandArgs, CommandResult } from '../core/types';
import { runAiArtifactCommand, streamResult } from './shared';

export async function runStorySplitCommand(args: CommandArgs): Promise<CommandResult> {
  const result = await runAiArtifactCommand(args, 'story-split');
  streamResult(args, result);
  return result;
}
