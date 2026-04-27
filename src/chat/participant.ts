/**
 * Product Dev Copilot Source Note
 *
 * File: src/chat/participant.ts
 * Purpose: Chat participant adapter. Converts Copilot Chat requests into normalized internal command execution.
 *
 * v1.3 addition:
 * - Collects prompt-optimizer-style request context for every command.
 * - Reads VS Code Chat attachments/references, active editor selection, and surrounding code once at the boundary.
 * - Passes the context into command handlers so all commands can optimize the user input consistently.
 */

import * as vscode from 'vscode';
import { routeCommand, normalizeCommand } from './command-router';
import { logError } from '../utils/logger';
import { getNextCommand, getNextStepHint } from '../workflow/workflow';
import { ProductDevCommand } from '../core/types';
import { collectRequestContext, RequestContext } from '../context/request-context';
import { getWorkspaceRoot } from '../context/workspace';

/**
 * Register the Chat Participant shown to users as `@product-dev`.
 *
 * VS Code passes each Copilot Chat request to this handler. The handler keeps UI
 * logic thin: normalize command, collect request context, route the command, and
 * return workflow-aware followups.
 */
export function createProductDevParticipant(extensionContext: vscode.ExtensionContext): vscode.ChatParticipant {
  const handler: vscode.ChatRequestHandler = async (request, chatContext, stream, token) => {
    const command = normalizeCommand(request.command);
    let requestContext: RequestContext | undefined;

    try {
      const workspaceRoot = getWorkspaceRoot();
      requestContext = await collectRequestContext(request, workspaceRoot);
    } catch (contextError) {
      logError('Failed to collect request context; continuing with raw prompt only.', contextError);
    }

    try {
      await routeCommand({
        command,
        userPrompt: request.prompt,
        extensionContext,
        chatContext,
        stream,
        token,
        request,
        requestContext
      });
      return { metadata: { command } };
    } catch (error) {
      logError(`Command /${command} failed.`, error);
      const message = error instanceof Error ? error.message : String(error);
      stream.markdown(`❌ **Command failed**: ${message}\n\nOpen the **Product Dev Copilot** output channel for details.`);
      return { metadata: { command, error: message } };
    }
  };

  const participant = vscode.chat.createChatParticipant('company-product-dev.product-dev', handler);
  participant.iconPath = vscode.Uri.joinPath(extensionContext.extensionUri, 'assets', 'product-dev.svg');
  participant.followupProvider = {
    provideFollowups(result) {
      const command = (result?.metadata as { command?: ProductDevCommand } | undefined)?.command ?? 'plan';
      const next = getNextCommand(command);
      const followups: vscode.ChatFollowup[] = [];
      if (next) {
        followups.push({
          prompt: `/${next} 继续执行上一步建议的下一阶段`,
          label: `Next: /${next}`,
          command: next
        });
      }
      followups.push(
        { prompt: '/loop-next 继续 Ralph Loop 下一轮', label: 'Continue loop', command: 'loop-next' },
        { prompt: '/loop-status 查看 Ralph Loop 状态', label: 'Loop status', command: 'loop-status' },
        { prompt: `/plan ${getNextStepHint(command)}`, label: 'Re-plan workflow', command: 'plan' }
      );
      return followups;
    }
  };
  return participant;
}
