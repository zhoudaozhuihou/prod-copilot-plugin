/**
 * Product Dev Copilot Source Note
 *
 * File: src/utils/logger.ts
 * Purpose: Lightweight logging helper for VS Code extension output.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import * as vscode from 'vscode';

let channel: vscode.OutputChannel | undefined;

export function getLogger(): vscode.OutputChannel {
  if (!channel) {
    channel = vscode.window.createOutputChannel('Product Dev Copilot');
  }
  return channel;
}

export function logInfo(message: string): void {
  getLogger().appendLine(`[info] ${new Date().toISOString()} ${message}`);
}

export function logError(message: string, error?: unknown): void {
  const detail = error instanceof Error ? `${error.message}\n${error.stack ?? ''}` : String(error ?? '');
  getLogger().appendLine(`[error] ${new Date().toISOString()} ${message} ${detail}`);
}
