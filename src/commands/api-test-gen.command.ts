import { CommandArgs, CommandResult } from '../core/types';
import { runAiArtifactCommand, runLocalInfoCommand, streamResult } from './shared';

export async function runApiTestGenCommand(args: CommandArgs): Promise<CommandResult> {
  const result = await runAiArtifactCommand(args, 'api-test-gen');
  streamResult(args, result);
  return result;
}
