/** Command handler for /skill-run. Executes one custom skill directly against a user task. */

import { CommandArgs, PromptPackage } from '../core/types';
import { getWorkspaceRoot } from '../context/workspace';
import { scanRepository } from '../context/repo-scanner';
import { generateWithLanguageModel } from '../ai/language-model';
import { writeArtifact } from '../writers/artifact-writer';
import { findSkillByName, loadSkills, renderSkillsForPrompt } from '../skills/skill-loader';
import { optimizeUserInput, renderOptimizedUserInput } from '../prompt/user-input-optimizer';

export async function runSkillRunCommand(args: CommandArgs): Promise<void> {
  const root = getWorkspaceRoot();
  const [skillName, ...taskParts] = args.userPrompt.trim().split(/\s+/);
  if (!skillName) {
    args.stream.markdown('# Skill Run\n\nPlease provide a skill name. Example: `@product-dev /skill-run bank-data-engineering review this SQL`.\n');
    return;
  }

  const skills = await loadSkills(root);
  const skill = findSkillByName(skills, skillName);
  if (!skill) {
    args.stream.markdown(`# Skill Not Found\n\nCould not find skill \`${skillName}\`. Run \`@product-dev /skill-scan\` to list available skills.\n`);
    return;
  }

  const repo = await scanRepository(root);
  const task = taskParts.join(' ') || 'Apply this skill to the current repository context and produce an actionable artifact.';
  const optimized = optimizeUserInput('skill-run', task, repo);
  const promptPackage: PromptPackage = {
    title: `Skill Run: ${skill.name}`,
    systemPrompt: 'You are @product-dev running a user-defined local skill. Follow the skill strictly, keep assumptions explicit, and produce a reviewable Markdown artifact.',
    role: `Act as the specialist described by the custom skill: ${skill.description}`,
    task: `Run custom skill \`${skill.name}\` for this task: ${task}`,
    context: `${renderOptimizedUserInput(optimized)}\n\n${renderSkillsForPrompt([skill])}`,
    constraints: [
      'Use the custom skill as the primary instruction pack.',
      'Do not invent company-specific rules not present in the skill or policy packs.',
      'Return Markdown only.',
      'End with Next Command.'
    ],
    outputSchema: '# Custom Skill Result\n\n## 1. Skill Applied\n## 2. Task Interpretation\n## 3. Findings / Output\n## 4. Risks and Missing Context\n## 5. Recommended Actions\n## 6. Next Command',
    artifactPath: `skills/${skill.name}-result.md`,
    workflowStage: 'Custom Skill Execution',
    nextStepHint: 'Next recommended command: `@product-dev /skill-review` if the skill output needs governance review, otherwise continue the relevant delivery workflow command.'
  };

  args.stream.progress(`Running custom skill ${skill.name}...`);
  const markdown = await generateWithLanguageModel(promptPackage, args.request, args.token);
  const artifactPath = await writeArtifact(repo, promptPackage.artifactPath, markdown);
  args.stream.markdown(`# Skill Run: ${skill.name}\n\n✅ Artifact written: \`${artifactPath}\`\n\n${markdown}\n`);
}
