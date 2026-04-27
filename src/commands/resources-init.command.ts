/** Initialize portable prompt and skill resources for Copilot/OpenCode migration. */

import { CommandArgs } from '../core/types';
import { getWorkspaceRoot } from '../context/workspace';
import { initializePortableAgentResources } from '../resources/portable-resource-initializer';

export async function runResourcesInitCommand(args: CommandArgs): Promise<void> {
  const root = getWorkspaceRoot();
  const result = await initializePortableAgentResources(root);
  args.stream.markdown(`# Portable Agent Resources Initialized\n\n`);
  args.stream.markdown(`## Created Directories\n\n${result.createdDirectories.map(d => `- \`${d}\``).join('\n') || '- None'}\n\n`);
  args.stream.markdown(`## Created Files\n\n${result.createdFiles.map(f => `- \`${f}\``).join('\n') || '- None; existing files were preserved.'}\n\n`);
  args.stream.markdown(`## Suggested Next Step\n\nRun \`@product-dev /resources-scan\`, then review or edit \`agent-resources/\` and \`.product-dev/prompts/\`.\n`);
}
