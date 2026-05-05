import * as vscode from 'vscode';
import { routeCommand, normalizeCommand } from './command-router';
import { logError } from '../utils/logger';
import { getSmartRecommendations } from '../workflow/workflow';
import { collectRequestContext } from '../context/request-context';
import { getWorkspaceRoot } from '../context/workspace';
import { fuzzyMatchCommand, getExposedCommand } from './command-registry';
import { LocalCodeIndexer } from '../code-intelligence/local-indexer';

export function createProductDevParticipant(extensionContext: vscode.ExtensionContext): vscode.ChatParticipant {
  const handler: vscode.ChatRequestHandler = async (request, chatContext, stream, token) => {
    let exposedCommand = (request.command || 'help').trim().replace(/^\//, '') || 'help';
    
    // Fuzzy match if user didn't specify a command but provided intent in prompt
    if (request.command === undefined && request.prompt) {
      const fuzzyMatch = fuzzyMatchCommand(request.prompt);
      if (fuzzyMatch) {
        exposedCommand = fuzzyMatch;
        stream.markdown(`*✨ 自动识别意图: 正在执行 \`/${exposedCommand}\` 命令*\n\n`);
      }
    }

    const command = normalizeCommand(exposedCommand);
    const workspaceRoot = getWorkspaceRoot();

    try {
      const requestContext = await collectRequestContext(request, workspaceRoot);

      // Initialize and apply local code indexing for non-help commands
      if (workspaceRoot && command !== 'help') {
        const indexer = new LocalCodeIndexer(workspaceRoot);
        await indexer.load();
        
        // Fast incremental update
        stream.progress('Updating local code index...');
        await indexer.buildOrUpdate({
          report: (p) => stream.progress(p.message || 'Indexing...')
        });

        // Determine blast radius context if a specific file is targeted (e.g. via active editor)
        if (requestContext.activeFile) {
          const impactFiles = indexer.getImpactRadius(requestContext.activeFile);
          // If the command is explicitly 'compress', use aggressive compression
          const useAggressive = command === 'compress';
          requestContext.graphContext = indexer.getReviewContext(impactFiles, useAggressive);
        }
      }

      await routeCommand({
        command,
        userPrompt: request.prompt,
        extensionContext,
        chatContext,
        stream,
        token,
        request,
        requestContext
      }, exposedCommand);
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
      const recommendations = getSmartRecommendations(command, extensionContext);
      
      return recommendations.map(rec => ({
        prompt: `/${rec} 执行此命令以进行下一步`,
        label: `Next: /${rec}`,
        command: rec
      }));
    }
  };
  return participant;
}
