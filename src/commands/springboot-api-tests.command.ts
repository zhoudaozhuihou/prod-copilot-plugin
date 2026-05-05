import { CommandArgs, CommandResult } from '../core/types';
import { runAiArtifactCommand, runLocalInfoCommand, streamResult } from './shared';

export async function runSpringbootApiTestsCommand(args: CommandArgs): Promise<CommandResult> {
  const result = await runAiArtifactCommand(args, 'springboot-api-tests');
  streamResult(args, result);
  return result;
}
