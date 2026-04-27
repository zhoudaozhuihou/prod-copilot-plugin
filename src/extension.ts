import * as vscode from 'vscode';
import { createProductDevParticipant } from './chat/participant';
import { getOutputChannel } from './utils/logger';

export function activate(context: vscode.ExtensionContext): void {
  const participant = createProductDevParticipant(context);
  context.subscriptions.push(participant);

  context.subscriptions.push(vscode.commands.registerCommand('companyProductDev.openOutputFolder', () => {
    getOutputChannel().show(true);
  }));
}

export function deactivate(): void {
  // No background resources to dispose.
}
