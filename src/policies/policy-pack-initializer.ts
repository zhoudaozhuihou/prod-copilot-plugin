/**
 * Product Dev Copilot Source Note
 *
 * File: src/policies/policy-pack-initializer.ts
 * Purpose: Policy pack initializer. Creates recommended local rule folders and starter templates.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ensureDir, exists } from '../utils/fs-utils';

export interface PolicyInitResult { createdDirectories: string[]; createdFiles: string[]; root: string; intakeFile: string; markdown: string; }
const LAYERS = ['global', 'company', 'department', 'country', 'project', 'environment/dev', 'environment/uat', 'environment/prod'];

export async function initializePolicyPacks(workspaceRoot: string): Promise<PolicyInitResult> {
  const root = '.product-dev/policy-packs';
  const createdDirectories: string[] = [];
  const createdFiles: string[] = [];
  async function mkdir(relativePath: string): Promise<void> { await ensureDir(path.join(workspaceRoot, relativePath)); createdDirectories.push(relativePath); }
  async function writeIfMissing(relativePath: string, content: string): Promise<void> {
    const absolute = path.join(workspaceRoot, relativePath); await ensureDir(path.dirname(absolute));
    if (!(await exists(absolute))) { await fs.writeFile(absolute, content, 'utf8'); createdFiles.push(relativePath); }
  }
  for (const layer of LAYERS) await mkdir(`${root}/${layer}`);
  await writeIfMissing(`${root}/README.md`, readmeTemplate());
  await writeIfMissing(`${root}/company/dq-rules.yaml`, dqRulesTemplate('company'));
  await writeIfMissing(`${root}/company/quality-gates.yaml`, qualityGatesTemplate('company'));
  await writeIfMissing(`${root}/company/security-standard.yaml`, securityTemplate('company'));
  await writeIfMissing(`${root}/company/privacy-standard.yaml`, privacyTemplate('company'));
  await writeIfMissing(`${root}/company/sql-standard.yaml`, sqlTemplate('company'));
  await writeIfMissing(`${root}/department/data-contract-standard.yaml`, dataContractTemplate('department'));
  await writeIfMissing(`${root}/department/sttm-standard.md`, sttmTemplate());
  await writeIfMissing(`${root}/department/reconciliation-standard.yaml`, reconciliationTemplate('department'));
  await writeIfMissing(`${root}/department/lineage-standard.yaml`, lineageTemplate('department'));
  await writeIfMissing(`${root}/department/scheduler-standard.yaml`, schedulerTemplate('department'));
  await writeIfMissing(`${root}/country/README.md`, countryReadme());
  await writeIfMissing(`${root}/project/naming-conventions.yaml`, namingTemplate('project'));
  await writeIfMissing(`${root}/project/review-checklist.md`, reviewChecklistTemplate());
  await writeIfMissing(`${root}/project/business-glossary.md`, glossaryTemplate());
  await writeIfMissing(`${root}/environment/prod/release-gates.yaml`, releaseGatesTemplate('prod'));
  await writeIfMissing(`${root}/environment/prod/runbook-standard.md`, runbookTemplate());
  const intakeFile = 'docs/00-intake/POLICY_PACK_QUESTIONNAIRE.md';
  await writeIfMissing(intakeFile, policyQuestionnaire());
  const markdown = `# Policy Pack Initialized\n\n## Root\n\n\`${root}\`\n\n## Created Directories\n\n${createdDirectories.map(d => `- \`${d}\``).join('\n')}\n\n## Created Files\n\n${createdFiles.length ? createdFiles.map(f => `- \`${f}\``).join('\n') : '- Existing policy files were preserved.'}\n\n## What You Should Do Next\n\n1. Open \`${intakeFile}\` and answer the policy questions.\n2. Replace template values in \`${root}/company\`, \`${root}/department\`, \`${root}/country\`, \`${root}/project\`, or \`${root}/environment/prod\` with your real company/department/country rules.\n3. Run \`@product-dev /policy-scan\` to verify loaded rules.\n4. Run \`@product-dev /policy-review\` to identify missing or conflicting rules.\n\n## Next Command\n\n\`@product-dev /policy-intake\`\n`;
  return { createdDirectories, createdFiles, root, intakeFile, markdown };
}
function readmeTemplate(): string { return `# Product Dev Policy Packs\n\nPlace company, department, country, project, and environment-specific rules here.\n\n## Precedence\n\nLater layers override earlier layers: global < company < department < country < project < environment.\n\n## Recommended Files\n\n- dq-rules.yaml\n- quality-gates.yaml\n- data-contract-standard.yaml\n- sttm-standard.md\n- reconciliation-standard.yaml\n- lineage-standard.yaml\n- privacy-standard.yaml\n- security-standard.yaml\n- sql-standard.yaml\n- naming-conventions.yaml\n- scheduler-standard.yaml\n- release-gates.yaml\n- runbook-standard.md\n- review-checklist.md\n- business-glossary.md\n`; }
function dqRulesTemplate(layer: string): string { return `layer: ${layer}\nversion: 1\nowner: TBD\nscope: all-data-products\nrules:\n  completeness:\n    required: true\n    defaultThreshold: 0.99\n  uniqueness:\n    required: true\n    businessKeyRequired: true\n  validity:\n    required: true\n  timeliness:\n    required: true\n    freshnessSlaMinutes: TBD\n  volumeAnomaly:\n    warningDeviationPercent: 20\n    blockerDeviationPercent: 50\n  reconciliation:\n    requiredForFinancialData: true\n    amountTolerance: TBD\nexceptionHandling:\n  exceptionTableRequired: true\n  alertTarget: TBD\n`; }
function qualityGatesTemplate(layer: string): string { return `layer: ${layer}\nversion: 1\ngates:\n  product:\n    prdRequired: true\n    acceptanceCriteriaRequired: true\n  api:\n    openApiRequired: true\n  code:\n    maxFileLines: 1000\n    maxFunctionLines: 200\n    maxComplexity: 15\n  data:\n    dataContractRequired: true\n    sttmRequired: true\n    dqRequired: true\n    reconciliationRequired: true\n    lineageRequired: true\n  release:\n    rollbackPlanRequired: true\n    runbookRequired: true\n`; }
function securityTemplate(layer: string): string { return `layer: ${layer}\nversion: 1\nrequirements:\n  authenticationRequired: true\n  authorizationRequired: true\n  leastPrivilegeRequired: true\n  secretsInCodeForbidden: true\n  auditLoggingRequired: true\n  productionDataInDevForbidden: true\n`; }
function privacyTemplate(layer: string): string { return `layer: ${layer}\nversion: 1\nclassificationLevels: [public, internal, confidential, restricted]\npiiFields: [customer_id, account_number, phone, email, national_id, address]\nmasking:\n  staticMaskingRequired: true\n  dynamicMaskingRequiredForRestricted: true\nretention:\n  defaultRetentionDays: TBD\ncrossBorder:\n  reviewRequired: true\n`; }
function sqlTemplate(layer: string): string { return `layer: ${layer}\nversion: 1\njoinRules:\n  drivingTableRequired: true\n  joinCardinalityRequired: true\n  noCartesianJoin: true\n  scd2EffectiveDateRequired: true\n  softDeleteFilterRequired: true\n  partitionFilterRequired: true\nperformance:\n  explainPlanRequired: true\nvalidation:\n  rowCountCheckRequired: true\n  amountCheckRequiredForFinancialData: true\n`; }
function dataContractTemplate(layer: string): string { return `layer: ${layer}\nversion: 1\nrequiredSections: [datasetOverview, ownerAndSla, grainAndKeys, schema, sensitivity, dqRules, compatibility]\nbreakingChanges:\n  deleteField: blocker\n  renameField: blocker\n  typeNarrowing: blocker\n  nullableToNotNull: blocker\n  meaningChange: blocker\n  slaDowngrade: high\napproval:\n  dataOwnerRequired: true\n  consumerNotificationRequired: true\n`; }
function sttmTemplate(): string { return `# STTM Standard\n\nEach mapping row must include Source System, Source Table, Source Field, Target Table, Target Field, Transformation, Filter, Join Rule, Null/Default Handling, DQ Check, and Owner.\n\nMandatory rules: state grain, driving table, join relationship, null/default handling, reconciliation fields, owner, and approval evidence.\n`; }
function reconciliationTemplate(layer: string): string { return `layer: ${layer}\nversion: 1\ncontrols:\n  countCheckRequired: true\n  amountCheckRequiredForFinancialData: true\n  keyCompletenessRequired: true\n  duplicateCheckRequired: true\n  missingRecordCheckRequired: true\n  exceptionTableRequired: true\n`; }
function lineageTemplate(layer: string): string { return `layer: ${layer}\nversion: 1\nrequirements:\n  tableLevelLineageRequired: true\n  fieldLevelLineageRequired: true\n  sensitiveFieldPropagationRequired: true\n  downstreamImpactRequired: true\n  mermaidGraphRequired: true\n`; }
function schedulerTemplate(layer: string): string { return `layer: ${layer}\nversion: 1\nrequirements:\n  dagRequired: true\n  dependencyMapRequired: true\n  retryPolicyRequired: true\n  timeoutRequired: true\n  slaRequired: true\n  alertingRequired: true\n  backfillProcedureRequired: true\n`; }
function namingTemplate(layer: string): string { return `layer: ${layer}\nversion: 1\nnaming:\n  tables:\n    bronze: ods_<domain>_<entity>\n    silver: dwd_<domain>_<entity>\n    gold: dm_<domain>_<metric>\n  auditColumns: [created_at, updated_at, source_system, batch_id]\n`; }
function releaseGatesTemplate(layer: string): string { return `layer: environment/${layer}\nversion: 1\nreleaseGates:\n  codeFrozen: true\n  dataContractApproved: true\n  dqPassed: true\n  reconciliationPassed: true\n  lineageUpdated: true\n  privacyApproved: true\n  rollbackPlanApproved: true\n  runbookApproved: true\n`; }
function reviewChecklistTemplate(): string { return `# Project Review Checklist\n\n- [ ] PRD is approved.\n- [ ] Data contract is approved.\n- [ ] STTM is complete.\n- [ ] DQ SQL is executable.\n- [ ] Reconciliation evidence is defined.\n- [ ] Field-level lineage is documented.\n- [ ] Sensitive fields are classified.\n- [ ] Rollback plan and runbook exist.\n`; }
function glossaryTemplate(): string { return `# Business Glossary\n\n| Term | Business Definition | Owner | Related Dataset | Notes |\n|---|---|---|---|---|\n| customer | TBD | TBD | TBD | TBD |\n`; }
function runbookTemplate(): string { return `# Runbook Standard\n\nEvery production data job runbook must include job purpose, SLA, dependencies, normal run procedure, failure diagnosis, rerun, backfill, DQ failure, reconciliation failure, escalation, and evidence capture.\n`; }
function countryReadme(): string { return `# Country Policy Layer\n\nAdd country or region-specific rules here, for example data residency, cross-border data transfer, PII/SPI classification, retention period, regulator evidence, and local approval workflow.\n`; }
function policyQuestionnaire(): string { return `# Policy Pack Questionnaire\n\n## Organization Scope\n\n1. Which company-wide engineering standards must be followed?\n2. Which data governance standards apply?\n3. Which security review process applies?\n4. Which release approval process applies?\n\n## Department Scope\n\n1. Does your department have its own DQ thresholds?\n2. Does your department require STTM format?\n3. Does your department require field-level lineage?\n4. Does your department have mandatory data contract sections?\n\n## Country / Region Scope\n\n1. Which country or region does the data belong to?\n2. Are there data residency or cross-border restrictions?\n3. Are there local PII/SPI classification rules?\n4. Are there retention or deletion requirements?\n\n## Project Scope\n\n1. What rules are special for this project?\n2. What naming conventions are required?\n3. What release gates are mandatory?\n4. Who approves exceptions?\n\n## Environment Scope\n\n1. Are dev/uat/prod rules different?\n2. Can production data be used in lower environments?\n3. Are DQ thresholds different in UAT vs production?\n4. Are production runbooks mandatory before go-live?\n\n## Next Action\n\nAfter editing the policy files, run: \`@product-dev /policy-scan\`\n`; }
