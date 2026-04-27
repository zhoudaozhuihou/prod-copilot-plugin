/** Initialize VS Code Copilot custom agents for native subagent orchestration. */

import { CommandArgs } from '../core/types';
import { getWorkspaceRoot } from '../context/workspace';
import { initializeSubagentAssets } from '../subagents/subagent-orchestrator';

export async function runAgentsInitCommand(args: CommandArgs): Promise<void> {
  const root = getWorkspaceRoot();
  args.stream.progress('Creating VS Code Copilot custom agents under .github/agents/...');
  const result = await initializeSubagentAssets(root);
  args.stream.markdown(`# VS Code Copilot Subagents Initialized\n\n`);
  args.stream.markdown(`## Created directories\n\n${result.createdDirectories.map(d => `- \`${d}\``).join('\n') || '- None'}\n\n`);
  args.stream.markdown(`## Created files\n\n${result.createdFiles.map(f => `- \`${f}\``).join('\n') || '- None; existing files were preserved.'}\n\n`);
  args.stream.markdown(`## Custom agent files\n\n${result.agentFiles.map(f => `- \`${f}\``).join('\n')}\n\n`);
  args.stream.markdown(`## How to use\n\n1. Open Copilot Chat in Agent mode.\n2. Select the workspace custom agent \`product-dev-coordinator\`.\n3. Give it a complex task. The coordinator has the \`agent\` tool and may delegate to specialized subagents.\n\n## Suggested next step\n\nRun \`@product-dev /agents-scan\`, then try a complex review such as \`@product-dev /review\`.\n`);
}
