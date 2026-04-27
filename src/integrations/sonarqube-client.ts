/**
 * Product Dev Copilot Source Note
 *
 * File: src/integrations/sonarqube-client.ts
 * Purpose: SonarQube integration placeholder/client boundary for future quality signal ingestion.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

export interface SonarIssue {
  key: string;
  severity: string;
  message: string;
  component: string;
}

export class SonarQubeClient {
  async listIssues(): Promise<SonarIssue[]> {
    return [];
  }
}
