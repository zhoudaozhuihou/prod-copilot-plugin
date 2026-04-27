/**
 * Product Dev Copilot Source Note
 *
 * File: src/context/workspace.ts
 * Purpose: Workspace helper. Locates the active VS Code workspace root.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import * as vscode from 'vscode';

export function getWorkspaceRoot(): string {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    throw new Error('No workspace folder found. Open a repository folder first.');
  }
  return folder.uri.fsPath;
}

export function getWorkspaceName(): string {
  return vscode.workspace.workspaceFolders?.[0]?.name ?? 'workspace';
}
