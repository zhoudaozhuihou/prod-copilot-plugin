/** Command handler for /skill-review. Reviews local custom skills using Anthropic-style quality criteria. */

import { CommandArgs, PromptPackage } from '../core/types';
import { getWorkspaceRoot } from '../context/workspace';
import { scanRepository } from '../context/repo-scanner';
import { generateWithLanguageModel } from '../ai/language-model';
import { writeArtifact } from '../writers/artifact-writer';
import { loadSkills, renderSkillInventory, renderSkillsForPrompt } from '../skills/skill-loader';

export async function runSkillReviewCommand(args: CommandArgs): Promise<void> {
  const root = getWorkspaceRoot();
  const repo = await scanRepository(root);
  const skills = await loadSkills(root);
  const promptPackage: PromptPackage = {
    title: 'Anthropic-Style Custom Skill Review',
    systemPrompt: 'You are @product-dev reviewing user-defined local skills for Anthropic-style skill quality, triggering reliability, progressive disclosure, safety, eval readiness, and OpenCode portability.',
    role: 'Act as a principal prompt engineer, AI SDLC architect, skill evaluator, and banking governance reviewer.',
    task: `Review all local skills and identify concrete improvements. User request: ${args.userPrompt}`,
    context: `## Skill Inventory\n\n${renderSkillInventory(skills, root)}\n\n${renderSkillsForPrompt(skills)}`,
    constraints: [
      'Use severity levels: Blocker, High, Medium, Low.',
      'Check required frontmatter: name and description.',
      'Treat description as the primary trigger mechanism; assess whether it is specific, pushy enough, and not overbroad.',
      'Check progressive disclosure: SKILL.md should be concise, with detailed references/scripts/evals split into resource directories.',
      'Check if the skill explains when to use it, workflow steps, output format, examples, safety boundaries, and next-step behavior.',
      'Check Karpathy-style execution behavior: assumptions before action, simplicity first, surgical scope, and verifiable success criteria.',
      'Check eval readiness: each skill should have 2-3 realistic eval prompts and, where objective, assertions.',
      'Check security: no hidden network calls, exfiltration, unsafe commands, secrets, or surprising behavior.',
      'Provide targeted rewrite patches for the worst 3 issues instead of rewriting every skill blindly.',
      'Return Markdown only.'
    ],
    outputSchema: '# Custom Skill Review\n\n## 1. Executive Summary\n## 2. Skill Inventory\n## 3. Triggering / Description Findings\n## 4. Progressive Disclosure Findings\n## 5. Instruction Quality Findings\n## 6. Eval Coverage Findings\n## 7. Security / Governance Findings\n## 8. Karpathy Execution Findings\n## 9. Required Fixes\n## 10. Recommended Skill Rewrites\n## 11. Next Command',
    artifactPath: 'skills/skill-review.md',
    workflowStage: 'Custom Skill Governance',
    nextStepHint: 'Next recommended command: edit the flagged SKILL.md files, then run `@product-dev /skill-scan` and `@product-dev /skill-review` again.'
  };
  const markdown = await generateWithLanguageModel(promptPackage, args.request, args.token);
  const artifactPath = await writeArtifact(repo, promptPackage.artifactPath, markdown);
  args.stream.markdown(`# Anthropic-Style Custom Skill Review\n\n✅ Artifact written: \`${artifactPath}\`\n\n${markdown}\n`);
}
