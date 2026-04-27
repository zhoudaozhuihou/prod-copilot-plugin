/** Scan portable prompt and skill resources for Copilot/OpenCode migration readiness. */

import { CommandArgs } from '../core/types';
import { getWorkspaceRoot } from '../context/workspace';
import { scanPortableAgentResources } from '../resources/portable-resource-initializer';

export async function runResourcesScanCommand(args: CommandArgs): Promise<void> {
  const root = getWorkspaceRoot();
  const markdown = await scanPortableAgentResources(root);
  args.stream.markdown(markdown);
}
