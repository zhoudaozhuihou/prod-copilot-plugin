/** Scan VS Code Copilot custom agent files used for subagent orchestration. */

import { CommandArgs } from '../core/types';
import { getWorkspaceRoot } from '../context/workspace';
import { scanSubagentAssets } from '../subagents/subagent-orchestrator';

export async function runAgentsScanCommand(args: CommandArgs): Promise<void> {
  const root = getWorkspaceRoot();
  const result = await scanSubagentAssets(root);
  args.stream.markdown(result.markdown);
}
