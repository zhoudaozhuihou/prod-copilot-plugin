/** Command handler for /skill-scan. Lists Anthropic-style custom local skills. */

import { CommandArgs } from '../core/types';
import { getWorkspaceRoot } from '../context/workspace';
import { loadSkills, renderSkillInventory } from '../skills/skill-loader';

export async function runSkillScanCommand(args: CommandArgs): Promise<void> {
  const root = getWorkspaceRoot();
  const skills = await loadSkills(root);
  args.stream.markdown(`# Custom Skill Scan\n\n`);
  if (!skills.length) {
    args.stream.markdown(`No custom skills found. Run \`@product-dev /skill-init\` first.\n`);
    return;
  }
  args.stream.markdown(`${renderSkillInventory(skills, root)}\n`);
  args.stream.markdown(`
## Anthropic-style quality checks

- Required metadata: \`name\`, \`description\`.
- The \`description\` should be a strong trigger description, not a short label.
- Put long domain detail into \`references/\`, deterministic helpers into \`scripts/\`, and tests into \`evals/\`.
- Run \`@product-dev /skill-review\` to get a severity-based review.\n- Non-trivial engineering skills should reference the Karpathy behavior contract: assumptions, simplicity, surgical scope, and verification.

## Next Command

Run \`@product-dev /skill-run <skill-name> <task>\` to execute one skill directly, or run any normal command to let matching skills auto-apply.
`);
}
