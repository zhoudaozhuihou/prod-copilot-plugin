/**
 * Product Dev Copilot Source Note
 *
 * File: src/commands/shared.ts
 * Purpose: Reusable execution pipeline for AI artifact commands: scan repo, load policies, compile prompt, call model, write output.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import { CommandArgs, ProductDevCommand, CommandResult } from '../core/types';
import { generateWithLanguageModel } from '../ai/language-model';
import { readGitContext } from '../context/git-context';
import { scanRepository } from '../context/repo-scanner';
import { getWorkspaceRoot } from '../context/workspace';
import { compilePrompt } from '../prompt/prompt-compiler';
import { writeArtifact } from '../writers/artifact-writer';
import { logInfo } from '../utils/logger';
import { getNextStepHint } from '../workflow/workflow';
import { optimizeUserInput, renderOptimizedUserInput } from '../prompt/user-input-optimizer';
import { loadApplicableSkills, renderSkillsForPrompt } from '../skills/skill-loader';
import { loadPortablePromptContext } from '../resources/portable-resource-loader';
import { renderRequestContext } from '../context/request-context';
import { renderSubagentGuidance } from '../subagents/subagent-orchestrator';

/**
 * Standard AI artifact command pipeline.
 *
 * Most slash commands are intentionally thin wrappers around this function.
 * This keeps behavior consistent across product, frontend, backend, and data commands:
 *
 * 1. Locate the active workspace.
 * 2. Scan repository context.
 * 3. Add git context only for commands that need change awareness.
 * 4. Compile a governed prompt with output schema and local Policy Pack context.
 * 5. Call the language model selected by Copilot Chat.
 * 6. Write a reviewable artifact to docs/.
 */
export async function runAiArtifactCommand(args: CommandArgs, command: ProductDevCommand): Promise<CommandResult> {
  // VS Code extensions can run with multiple workspace folders; this project uses the active root.
  const workspaceRoot = getWorkspaceRoot();
  args.stream.progress(`Scanning repository context for /${command}...`);
  // Repository context is the main grounding source for the model.
  // Keep scanner limits conservative so prompts remain useful and bounded.
  const repo = await scanRepository(workspaceRoot);

  // Git context is relatively expensive and noisy, so include it only for commands where
  // changes, review, release readiness, migration, or lineage analysis are relevant.
  const needsGit = ['review', 'doc-review', 'data-review', 'diff', 'release', 'test', 'data-test', 'quality', 'plan', 'migration', 'lineage', 'sql-review'].includes(command);
  const git = needsGit ? await readGitContext(workspaceRoot) : undefined;
  // Optimize every user request before prompt compilation.
  // This normalizes vague input into goal/scope/constraints/missing questions/output expectations.
  const optimized = optimizeUserInput(command, args.userPrompt, repo, args.requestContext);
  const skills = await loadApplicableSkills(workspaceRoot, command, optimized);
  const subagentGuidance = renderSubagentGuidance(command, optimized, repo);
  const portablePromptContext = await loadPortablePromptContext(workspaceRoot, command);
  const enrichedPrompt = [
    args.userPrompt,
    renderOptimizedUserInput(optimized),
    renderRequestContext(args.requestContext),
    subagentGuidance,
    portablePromptContext,
    renderSkillsForPrompt(skills)
  ].join('\n\n');

  // PromptPackage is the internal contract between command handlers and model calls.
  // It contains role, task, constraints, output schema, policy context, custom skills, and artifact path.
  const promptPackage = compilePrompt(command, enrichedPrompt, repo, git);

  args.stream.progress(`Generating ${promptPackage.title}...`);
  const markdown = await generateWithLanguageModel(promptPackage, args.request, args.token);
  const artifactPath = await writeArtifact(repo, promptPackage.artifactPath, markdown);
  logInfo(`Command /${command} completed. Artifact: ${artifactPath ?? 'not written'}`);
  return { title: promptPackage.title, markdown, artifactPath, nextStepHint: promptPackage.nextStepHint };
}

/**
 * Render command result back into Copilot Chat.
 *
 * The artifact path is displayed first so users know where the durable output lives.
 * The final Suggested Next Step keeps the ordered workflow moving without forcing
 * users to remember the full command sequence.
 */
export function streamResult(args: CommandArgs, result: CommandResult): void {
  args.stream.markdown(`# ${result.title}\n\n`);
  if (result.artifactPath) {
    args.stream.markdown(`✅ Artifact written: \`${result.artifactPath}\`\n\n`);
  }
  args.stream.markdown(result.markdown);
  const next = result.nextStepHint ?? getNextStepHint(args.command);
  args.stream.markdown(`\n\n---\n\n## Suggested Next Step\n\n${next}\n`);
}
