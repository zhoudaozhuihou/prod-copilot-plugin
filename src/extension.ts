/**
 * Product Dev Copilot Source Note
 *
 * File: src/extension.ts
 * Purpose: VS Code extension entry point. Registers the @product-dev chat participant and optional command-palette shortcuts.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import * as path from 'path';
import * as vscode from 'vscode';
import { createProductDevParticipant } from './chat/participant';
import { getWorkspaceRoot } from './context/workspace';
import { ensureDir } from './utils/fs-utils';

export function activate(context: vscode.ExtensionContext) {
  const participant = createProductDevParticipant(context);
  context.subscriptions.push(participant);

  context.subscriptions.push(vscode.commands.registerCommand('companyProductDev.openOutputFolder', async () => {
    const root = getWorkspaceRoot();
    const outputRoot = vscode.workspace.getConfiguration('companyProductDev').get<string>('outputRoot') ?? 'docs';
    const uri = vscode.Uri.file(path.join(root, outputRoot));
    await ensureDir(uri.fsPath);
    await vscode.commands.executeCommand('vscode.openFolder', uri, { forceNewWindow: false });
  }));

  context.subscriptions.push(vscode.commands.registerCommand('companyProductDev.runBrainstorm', async () => {
    await vscode.commands.executeCommand('workbench.action.chat.open', {
      query: '@product-dev /brainstorm 为当前产品设计三个高价值功能方向，并输出 MVP 推荐'
    });
  }));
}

export function deactivate() {}
