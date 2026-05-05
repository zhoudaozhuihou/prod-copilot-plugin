import { CommandArgs, CommandResult } from '../core/types';
import { runAiArtifactCommand, runLocalInfoCommand, streamResult } from './shared';

export async function runPythonApiTestsCommand(args: CommandArgs): Promise<CommandResult> {
  const result = await runAiArtifactCommand(args, 'python-api-tests');
  streamResult(args, result);
  return result;
}
