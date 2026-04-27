/**
 * Product Dev Copilot Source Note
 *
 * File: src/prompt/context-builder.ts
 * Purpose: Context builder. Assembles repository, git, user request, config, and policy-pack context for prompt injection.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import { GitContext, RepoContext } from '../core/types';
import { truncate } from '../utils/fs-utils';
import { renderPolicyPackContext } from '../policies/policy-pack-loader';

export function buildContextBlock(repo: RepoContext, git?: GitContext, extra?: string): string {
  const fileContext = repo.sourceFiles
    .map(file => `## File: ${file.path}\nLanguage: ${file.language}\nSize: ${file.size}\n\n\`\`\`${file.language}\n${file.excerpt}\n\`\`\``)
    .join('\n\n');

  return truncate(`# Repository\n\n- Name: ${repo.repoName}\n- Project: ${repo.config.project?.name ?? repo.repoName}\n- Domain: ${repo.config.project?.domain ?? 'unknown'}\n- Criticality: ${repo.config.project?.businessCriticality ?? 'unknown'}\n- Tech stack: ${repo.techStack.join(', ') || 'unknown'}\n\n# Package / Build Hints\n\n${repo.packageInfo ?? 'No package metadata detected.'}\n\n# Detected Routes\n\n${repo.routeHints.map(x => `- ${x}`).join('\n') || '- None detected'}\n\n# Detected API Calls\n\n${repo.apiHints.map(x => `- ${x}`).join('\n') || '- None detected'}\n\n# Detected Frontend Hints\n\n${repo.frontendHints.map(x => `- ${x}`).join('\n') || '- None detected'}\n\n# Detected Backend Hints\n\n${repo.backendHints.map(x => `- ${x}`).join('\n') || '- None detected'}\n\n# Detected Database Hints\n\n${repo.databaseHints.map(x => `- ${x}`).join('\n') || '- None detected'}\n\n# Detected Data Pipeline Hints\n\n${repo.dataPipelineHints.map(x => `- ${x}`).join('\n') || '- None detected'}\n\n${renderPolicyPackContext(repo.policyPacks)}\n\n# Git Context\n\n- Branch: ${git?.branch ?? 'unknown'}\n- Last commit: ${git?.lastCommit ?? 'unknown'}\n\n## Status\n\n${git?.status ?? 'No git status available.'}\n\n## Diff\n\n${git?.diff ?? 'No git diff available.'}\n\n# User Additional Request\n\n${extra ?? ''}\n\n# Source File Excerpts\n\n${fileContext}`, 60_000);
}
