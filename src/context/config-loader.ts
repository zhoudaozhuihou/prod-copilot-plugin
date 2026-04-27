/**
 * Product Dev Copilot Source Note
 *
 * File: src/context/config-loader.ts
 * Purpose: Project config loader. Reads .product-dev/config.yaml and applies safe defaults.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import * as path from 'path';
import * as vscode from 'vscode';
import { ProductDevConfig } from '../core/types';
import { readTextIfExists } from '../utils/fs-utils';
import { parseSimpleYaml } from '../utils/simple-yaml';

export async function loadProductDevConfig(workspaceRoot: string): Promise<ProductDevConfig> {
  const vscodeConfig = vscode.workspace.getConfiguration('companyProductDev');
  const configPath = path.join(workspaceRoot, '.product-dev', 'config.yaml');
  const text = await readTextIfExists(configPath);
  const fileConfig = text ? (parseSimpleYaml(text) as Partial<ProductDevConfig>) : {};

  return {
    outputRoot: String(fileConfig.outputRoot ?? vscodeConfig.get('outputRoot') ?? 'docs'),
    maxContextFiles: Number(fileConfig.maxContextFiles ?? vscodeConfig.get('maxContextFiles') ?? 60),
    writeArtifacts: Boolean(fileConfig.writeArtifacts ?? vscodeConfig.get('writeArtifacts') ?? true),
    project: fileConfig.project,
    qualityGates: fileConfig.qualityGates,
    standards: fileConfig.standards,
    policyPacks: fileConfig.policyPacks,
    integrations: fileConfig.integrations
  };
}
