/**
 * Product Dev Copilot Source Note
 *
 * File: src/commands/lineage.command.ts
 * Purpose: Command handler for @lineage. Delegates to the shared AI artifact pipeline or performs local workflow actions.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import { runAiArtifactCommand, streamResult } from './shared';
import { CommandArgs } from '../core/types';

export async function runLineageCommand(args: CommandArgs): Promise<void> {
  const result = await runAiArtifactCommand(args, 'lineage');
  streamResult(args, result);
}
