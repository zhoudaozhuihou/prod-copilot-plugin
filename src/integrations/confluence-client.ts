/**
 * Product Dev Copilot Source Note
 *
 * File: src/integrations/confluence-client.ts
 * Purpose: Confluence integration placeholder/client boundary for future documentation publishing.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

export interface ConfluencePageDraft {
  title: string;
  spaceKey: string;
  markdown: string;
}

export class ConfluenceClient {
  async publishPage(_draft: ConfluencePageDraft): Promise<string> {
    throw new Error('Confluence integration is not implemented in the MVP. Add credentials and REST client in Phase 3.');
  }
}
