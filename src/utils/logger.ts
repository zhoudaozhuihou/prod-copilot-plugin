import * as vscode from 'vscode';

let output: vscode.OutputChannel | undefined;

export function getOutputChannel(): vscode.OutputChannel {
  if (!output) {
    output = vscode.window.createOutputChannel('Product Dev Copilot');
  }
  return output;
}

export function logInfo(message: string): void {
  getOutputChannel().appendLine(`[INFO] ${new Date().toISOString()} ${message}`);
}

export function logError(message: string, error?: unknown): void {
  const detail = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack ?? ''}` : String(error ?? '');
  getOutputChannel().appendLine(`[ERROR] ${new Date().toISOString()} ${message}\n${detail}`);
}
