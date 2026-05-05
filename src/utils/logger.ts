import * as vscode from 'vscode';

let output: vscode.OutputChannel | undefined;

const LOG_LEVEL_LABEL: Record<string, string> = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

function formatMessage(level: string, message: string, error?: unknown): string {
  const timestamp = new Date().toISOString();
  const label = LOG_LEVEL_LABEL[level] ?? level;
  const detail = error instanceof Error
    ? `\n${error.name}: ${error.message}${error.stack ? '\n' + error.stack : ''}`
    : error !== undefined
      ? '\n' + String(error)
      : '';
  return `[${label}] ${timestamp} ${message}${detail}`;
}

export function getOutputChannel(): vscode.OutputChannel {
  if (!output) {
    output = vscode.window.createOutputChannel('Product Dev Copilot');
  }
  return output;
}

export function logDebug(message: string): void {
  getOutputChannel().appendLine(formatMessage('DEBUG', message));
}

export function logInfo(message: string): void {
  getOutputChannel().appendLine(formatMessage('INFO', message));
}

export function logWarn(message: string, error?: unknown): void {
  getOutputChannel().appendLine(formatMessage('WARN', message, error));
}

export function logError(message: string, error?: unknown): void {
  getOutputChannel().appendLine(formatMessage('ERROR', message, error));
}
