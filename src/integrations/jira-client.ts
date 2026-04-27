/**
 * Product Dev Copilot Source Note
 *
 * File: src/integrations/jira-client.ts
 * Purpose: Jira integration placeholder/client boundary for future enterprise connectors.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

export interface JiraStoryDraft {
  summary: string;
  description: string;
  acceptanceCriteria: string[];
  labels?: string[];
}

export class JiraClient {
  async createStory(_draft: JiraStoryDraft): Promise<string> {
    throw new Error('Jira integration is not implemented in the MVP. Add credentials and REST client in Phase 3.');
  }
}
