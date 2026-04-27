import { CommandArgs, CommandResult } from '../core/types';
import { runAiArtifactCommand, runLocalInfoCommand, streamResult } from './shared';

export async function runBackendApiScanCommand(args: CommandArgs): Promise<CommandResult> {
  const result = await runLocalInfoCommand(args, 'backend-api-scan');
  return result;
}
