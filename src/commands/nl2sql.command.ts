/** Command handler for @product-dev /nl2sql. */

import { runAiArtifactCommand, streamResult } from './shared';
import { CommandArgs } from '../core/types';

export async function runNl2sqlCommand(args: CommandArgs): Promise<void> {
  const result = await runAiArtifactCommand(args, 'nl2sql');
  streamResult(args, result);
}
