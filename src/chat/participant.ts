import * as vscode from 'vscode';
import { routeCommand, normalizeCommand } from './command-router';
import { logError } from '../utils/logger';
import { getNextCommand } from '../workflow/workflow';
import { collectRequestContext } from '../context/request-context';
import { getWorkspaceRoot } from '../context/workspace';

export function createProductDevParticipant(extensionContext: vscode.ExtensionContext): vscode.ChatParticipant {
  const handler: vscode.ChatRequestHandler = async (request, chatContext, stream, token) => {
    const command = normalizeCommand(request.command);
    const workspaceRoot = getWorkspaceRoot();

    try {
      const requestContext = await collectRequestContext(request, workspaceRoot);
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
      const command = (result?.metadata as { command?: string } | undefined)?.command ?? 'plan';
      const next = getNextCommand(command);
      const followups: vscode.ChatFollowup[] = [];
      if (next) {
        followups.push({
          prompt: `/${next} 继续执行上一步建议的下一阶段`,
          label: `Next: /${next}`,
          command: next
        });
      }
      if (['backend', 'springboot', 'python', 'api', 'backend-api-scan'].includes(command)) {
        followups.push({
          prompt: '/api-test-gen 基于后端代码生成 API 请求实例和自动化测试用例',
          label: 'Generate API tests',
          command: 'api-test-gen'
        });
      }
      return followups;
    }
  };
  return participant;
}
