/**
 * Product Dev Copilot Source Note
 *
 * File: src/governance/quality-gates.ts
 * Purpose: Quality gate utilities for code, data, security, and release checks.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

export interface QualityGateFinding {
  severity: 'blocker' | 'major' | 'minor';
  rule: string;
  message: string;
}

export function evaluateTextQualityGates(filePath: string, content: string): QualityGateFinding[] {
  const findings: QualityGateFinding[] = [];
  const lines = content.split(/\r?\n/);
  if (lines.length > 1000) {
    findings.push({ severity: 'major', rule: 'maxFileLines', message: `${filePath} has ${lines.length} lines.` });
  }
  if (/password\s*=|api[_-]?key\s*=|secret\s*=/i.test(content)) {
    findings.push({ severity: 'blocker', rule: 'noHardcodedSecrets', message: `${filePath} may contain a hardcoded secret.` });
  }
  return findings;
}
