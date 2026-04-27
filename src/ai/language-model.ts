import * as vscode from 'vscode';
import { PromptPackage } from '../core/types';
import { logError } from '../utils/logger';

export async function generateWithLanguageModel(
  promptPackage: PromptPackage,
  request: vscode.ChatRequest,
  token: vscode.CancellationToken
): Promise<string> {
  const model = request.model ?? (await selectFallbackModel());
  if (!model) {
    return deterministicFallback(promptPackage);
  }

  try {
    const messages = [vscode.LanguageModelChatMessage.User(renderPrompt(promptPackage))];
    const response = await model.sendRequest(messages, {}, token);
    const parts: string[] = [];
    for await (const fragment of response.text) {
      parts.push(fragment);
    }
    return parts.join('').trim() || deterministicFallback(promptPackage);
  } catch (error) {
    logError('Language model request failed; using deterministic fallback.', error);
    return deterministicFallback(promptPackage);
  }
}

export function renderPrompt(promptPackage: PromptPackage): string {
  return `# System Prompt\n\n${promptPackage.systemPrompt}\n\n# Specialist Role\n\n${promptPackage.role}\n\n# Task\n\n${promptPackage.task}\n\n# Workflow Stage\n\n${promptPackage.workflowStage}\n\n# Repository / Git / User / Attachment Context\n\n${promptPackage.context}\n\n# Constraints\n\n${promptPackage.constraints.map(c => `- ${c}`).join('\n')}\n\n# Required Output Schema\n\n${promptPackage.outputSchema}\n\n# Next Step Contract\n\nAfter the main artifact, include a final section named \`Next Command\` with exactly one recommended @product-dev command and why it is next. Suggested next step: ${promptPackage.nextStepHint}\n\nReturn Markdown only. Be specific, structured, and actionable.`;
}

async function selectFallbackModel(): Promise<vscode.LanguageModelChat | undefined> {
  try {
    const candidates = await vscode.lm.selectChatModels({});
    return candidates[0];
  } catch (error) {
    logError('Could not select fallback language model.', error);
    return undefined;
  }
}

function deterministicFallback(promptPackage: PromptPackage): string {
  return `# ${promptPackage.title}\n\n> No accessible Copilot language model was available, so this deterministic scaffold was generated. Sign in to GitHub Copilot and approve model access to get AI-generated content.\n\n## Task\n\n${promptPackage.task}\n\n## Required Structure\n\n${promptPackage.outputSchema}\n\n## Context Summary\n\n${promptPackage.context.slice(0, 6000)}\n\n## Next Command\n\n${promptPackage.nextStepHint}\n`;
}
