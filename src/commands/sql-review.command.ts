/** Command handler for @product-dev /sql-review. */

import { runAiArtifactCommand, streamResult } from './shared';
import { CommandArgs } from '../core/types';

export async function runSqlReviewCommand(args: CommandArgs): Promise<void> {
  const result = await runAiArtifactCommand(args, 'sql-review');
  streamResult(args, result);
}
