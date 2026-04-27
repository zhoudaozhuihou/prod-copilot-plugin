/**
 * Product Dev Copilot Source Note
 *
 * File: src/commands/api.command.ts
 * Purpose: Command handler for @api. Delegates to the shared AI artifact pipeline or performs local workflow actions.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import { CommandArgs, CommandResult } from '../core/types';
import { runAiArtifactCommand, streamResult } from './shared';

export async function runApiCommand(args: CommandArgs): Promise<CommandResult> {
  const result = await runAiArtifactCommand(args, 'api');
  streamResult(args, result);
  return result;
}
