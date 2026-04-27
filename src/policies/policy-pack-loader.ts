/**
 * Product Dev Copilot Source Note
 *
 * File: src/policies/policy-pack-loader.ts
 * Purpose: Policy pack loader. Reads company/department/country/project/environment local rule files and renders them as prompt context.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { PolicyPackContext, PolicyPackFile, ProductDevConfig } from '../core/types';
import { exists, normalizePath, truncate } from '../utils/fs-utils';

const DEFAULT_PRECEDENCE = ['global', 'company', 'department', 'country', 'project', 'environment'];
export const RECOMMENDED_POLICY_FILES = ['dq-rules.yaml','quality-gates.yaml','data-contract-standard.yaml','sttm-standard.md','reconciliation-standard.yaml','lineage-standard.yaml','privacy-standard.yaml','security-standard.yaml','sql-standard.yaml','naming-conventions.yaml','scheduler-standard.yaml','release-gates.yaml','runbook-standard.md','review-checklist.md','business-glossary.md'];
const SUPPORTED_EXTENSIONS = new Set(['.md', '.yaml', '.yml', '.json', '.txt', '.csv', '.sql']);

/**
 * Load repository-local policy packs.
 *
 * This function is the main customization point for company, department, country,
 * project, and environment rules. It deliberately reads plain files from the repo
 * so teams can review and version their governance rules together with code.
 */
export async function loadPolicyPackContext(workspaceRoot: string, config: ProductDevConfig): Promise<PolicyPackContext> {
  const policyConfig = config.policyPacks ?? {};
  const enabled = policyConfig.enabled !== false;
  const root = normalizePath(policyConfig.root ?? '.product-dev/policy-packs');
  const precedence = Array.isArray(policyConfig.precedence) ? policyConfig.precedence : DEFAULT_PRECEDENCE;
  const absoluteRoot = path.join(workspaceRoot, root);

  if (!enabled) return { enabled: false, root, precedence, files: [], missingRecommendedFiles: [], warnings: ['Policy packs are disabled in .product-dev/config.yaml.'] };

  const files: PolicyPackFile[] = [];
  // Policy files are loaded as excerpts, not blindly injected in full.
  // This prevents very large rule files from overwhelming the prompt context.
  if (await exists(absoluteRoot)) {
    const absoluteFiles = await collectPolicyFiles(absoluteRoot);
    for (const absoluteFile of absoluteFiles) {
      const relToRoot = normalizePath(path.relative(absoluteRoot, absoluteFile));
      const relToWorkspace = normalizePath(path.relative(workspaceRoot, absoluteFile));
      const parts = relToRoot.split('/');
      const layer = parts[0] || 'unknown';
      const category = inferPolicyCategory(relToRoot);
      const text = await fs.readFile(absoluteFile, 'utf8').catch(() => '');
      files.push({ path: relToWorkspace, layer, category, size: Buffer.byteLength(text, 'utf8'), excerpt: truncate(text, 2500) });
    }
  }

  const requiredFiles = Array.isArray(policyConfig.requiredFiles) ? policyConfig.requiredFiles : RECOMMENDED_POLICY_FILES;
  const presentNames = new Set(files.map(f => path.basename(f.path).toLowerCase()));
  const missingRecommendedFiles = requiredFiles.filter(name => !presentNames.has(name.toLowerCase()));
  const warnings = detectPolicyWarnings(files, precedence);
  return { enabled, root, precedence, files: sortByPrecedence(files, precedence), missingRecommendedFiles, warnings };
}

/**
 * Render policy packs into a prompt-readable block.
 *
 * Generated prompts treat this block as local rules with higher authority than
 * generic built-in guidance. Missing files and warnings are surfaced to avoid
 * inventing organization-specific thresholds.
 */
export function renderPolicyPackContext(policy: PolicyPackContext): string {
  if (!policy.enabled) return '# Policy Packs\n\nPolicy packs are disabled.\n';
  const files = policy.files.map(file => `## ${file.path}\n\n- Layer: ${file.layer}\n- Category: ${file.category}\n- Size: ${file.size} bytes\n\n\`\`\`${languageFor(file.path)}\n${file.excerpt}\n\`\`\``).join('\n\n');
  return `# Policy Packs / Local Rules Overlay\n\nThese rules are user/company supplied. They override generic defaults. Apply the configured precedence when rules conflict.\n\n## Root\n\n\`${policy.root}\`\n\n## Precedence\n\n${policy.precedence.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n## Warnings\n\n${policy.warnings.map(w => `- ${w}`).join('\n') || '- None'}\n\n## Missing Recommended Files\n\n${policy.missingRecommendedFiles.map(f => `- ${f}`).join('\n') || '- None'}\n\n## Loaded Policy Files\n\n${files || 'No policy files loaded yet. Run `@product-dev /policy-init` and add your local rules.'}`;
}

export function buildPolicyInventoryMarkdown(policy: PolicyPackContext): string {
  const rows = policy.files.map(f => `| ${f.layer} | ${f.category} | \`${f.path}\` | ${f.size} |`).join('\n');
  return `# Policy Pack Scan Report\n\n## Status\n\n- Enabled: ${policy.enabled}\n- Root: \`${policy.root}\`\n- Loaded files: ${policy.files.length}\n\n## Precedence\n\n${policy.precedence.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n## Inventory\n\n| Layer | Category | File | Size |\n|---|---|---|---:|\n${rows || '| - | - | No policy files found | 0 |'}\n\n## Missing Recommended Files\n\n${policy.missingRecommendedFiles.map(f => `- [ ] ${f}`).join('\n') || '- None'}\n\n## Warnings\n\n${policy.warnings.map(w => `- ${w}`).join('\n') || '- None'}\n\n## How Precedence Works\n\nWhen two files define the same rule, later layers override earlier layers: \`global < company < department < country < project < environment\`.\n\n## Next Command\n\nRun \`@product-dev /policy-review\` to review conflicts, missing rules, and applicability.\n`;
}

async function collectPolicyFiles(dir: string): Promise<string[]> { const result: string[] = []; await walk(dir, result); return result; }
async function walk(dir: string, result: string[]): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, result);
    else if (entry.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      const stat = await fs.stat(full).catch(() => undefined);
      if (stat && stat.size <= 400_000) result.push(full);
    }
  }
}
function inferPolicyCategory(relPath: string): string {
  const name = relPath.toLowerCase();
  if (name.includes('dq') || name.includes('quality')) return 'data-quality';
  if (name.includes('gate')) return 'quality-gate';
  if (name.includes('privacy') || name.includes('mask') || name.includes('pii')) return 'privacy';
  if (name.includes('security') || name.includes('access')) return 'security';
  if (name.includes('sql')) return 'sql';
  if (name.includes('contract')) return 'data-contract';
  if (name.includes('sttm') || name.includes('mapping')) return 'sttm';
  if (name.includes('reconcile')) return 'reconciliation';
  if (name.includes('lineage')) return 'lineage';
  if (name.includes('scheduler') || name.includes('sla')) return 'scheduler';
  if (name.includes('release')) return 'release';
  if (name.includes('runbook')) return 'runbook';
  if (name.includes('glossary') || name.includes('term')) return 'glossary';
  return 'general';
}
function detectPolicyWarnings(files: PolicyPackFile[], precedence: string[]): string[] {
  const warnings: string[] = [];
  const known = new Set(precedence);
  for (const file of files) if (!known.has(file.layer)) warnings.push(`Unknown policy layer '${file.layer}' in ${file.path}. Add it to policyPacks.precedence if intentional.`);
  const byCategory = new Map<string, PolicyPackFile[]>();
  for (const file of files) byCategory.set(file.category, [...(byCategory.get(file.category) ?? []), file]);
  for (const [category, grouped] of byCategory) if (grouped.length > 1 && new Set(grouped.map(g => g.layer)).size > 1) warnings.push(`Multiple ${category} rules found across layers. Review precedence and conflicts.`);
  return warnings;
}
function sortByPrecedence(files: PolicyPackFile[], precedence: string[]): PolicyPackFile[] { const rank = new Map(precedence.map((p, i) => [p, i])); return [...files].sort((a, b) => (rank.get(a.layer) ?? 999) - (rank.get(b.layer) ?? 999) || a.path.localeCompare(b.path)); }
function languageFor(filePath: string): string { const ext = path.extname(filePath).toLowerCase(); if (ext === '.md') return 'markdown'; if (ext === '.yaml' || ext === '.yml') return 'yaml'; if (ext === '.json') return 'json'; if (ext === '.sql') return 'sql'; if (ext === '.csv') return 'csv'; return 'text'; }
