/** Command handler for /skill-init. Creates the local custom skill registry. */

import { CommandArgs } from '../core/types';
import { getWorkspaceRoot } from '../context/workspace';
import { initializeSkills } from '../skills/skill-initializer';

export async function runSkillInitCommand(args: CommandArgs): Promise<void> {
  const root = getWorkspaceRoot();
  args.stream.progress('Creating .product-dev/skills registry and example skills...');
  const result = await initializeSkills(root);
  args.stream.markdown(`# Skill Registry Initialized\n\n`);
  args.stream.markdown(`Created/verified custom skill folders under \`.product-dev/skills/\`.\n\n`);
  args.stream.markdown(`## Created Directories\n\n${result.createdDirectories.map(d => `- \`${d}\``).join('\n') || '- None'}\n\n`);
  args.stream.markdown(`## Created Files\n\n${result.createdFiles.map(f => `- \`${f}\``).join('\n') || '- None'}\n\n`);
  args.stream.markdown(`## Next Command\n\nRun \`@product-dev /skill-scan\` to verify loaded skills, or edit \`.product-dev/skills/<skill-name>/SKILL.md\` to add your department-specific skill.\n`);
}
