/**
 * Product Dev Copilot Source Note
 *
 * File: src/workflow/workflow.ts
 * Purpose: Workflow registry. Defines ordered command sequences, stage labels, and next-step hints.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import { ProductDevCommand } from '../core/types';

export interface WorkflowStep {
  command: ProductDevCommand;
  label: string;
  purpose: string;
  artifact: string;
  next?: ProductDevCommand;
  category?: 'workflow' | 'tool';
}

export const ORDERED_WORKFLOW: WorkflowStep[] = [
  { command: 'init', label: 'Initialize', purpose: 'Create configuration, folders, workflow conventions, and default policy pack structure.', artifact: '.product-dev/config.yaml', next: 'policy-init', category: 'workflow' },
  { command: 'policy-init', label: 'Policy pack initialization', purpose: 'Create local rules folders for company, department, country, project, and environment overlays.', artifact: '.product-dev/policy-packs/README.md', next: 'policy-intake', category: 'workflow' },
  { command: 'policy-intake', label: 'Policy intake', purpose: 'Ask which company, department, country, project, and environment rules must be supplied.', artifact: 'docs/00-intake/POLICY_PACK_QUESTIONNAIRE.md', next: 'policy-scan', category: 'workflow' },
  { command: 'policy-scan', label: 'Policy scan', purpose: 'Inventory loaded policy files, missing recommended rules, and local overlay status.', artifact: 'docs/policy/policy-pack-scan.md', next: 'policy-review', category: 'workflow' },
  { command: 'policy-review', label: 'Policy review', purpose: 'Review rule conflicts, precedence, completeness, and workflow applicability.', artifact: 'docs/policy/policy-review.md', next: 'scan', category: 'workflow' },
  { command: 'scan', label: 'Repository scan', purpose: 'Understand repo structure, tech stack, routes, APIs, and data hints.', artifact: 'docs/context/repo-map.md', next: 'plan', category: 'workflow' },
  { command: 'plan', label: 'Delivery plan', purpose: 'Create ordered execution plan and choose relevant tracks.', artifact: 'docs/product/delivery-plan.md', next: 'brainstorm', category: 'workflow' },
  { command: 'brainstorm', label: 'Product discovery', purpose: 'Generate opportunities, alternatives, MVP candidates, and experiments.', artifact: 'docs/product/brainstorm.md', next: 'feature', category: 'workflow' },
  { command: 'feature', label: 'Feature design', purpose: 'Converge ideas into feature scope, flow, states, acceptance criteria, and metrics.', artifact: 'docs/product/feature-design.md', next: 'prd', category: 'workflow' },
  { command: 'prd', label: 'PRD', purpose: 'Produce engineering-ready requirements, non-functional needs, permissions, and risks.', artifact: 'docs/prd/generated-prd.md', next: 'journey', category: 'workflow' },
  { command: 'journey', label: 'Journey analysis', purpose: 'Map user path, decision points, friction, missing states, and instrumentation.', artifact: 'docs/journey/user-journey.md', next: 'design-md', category: 'workflow' },
  { command: 'design-md', label: 'DESIGN.md extraction', purpose: 'Extract or generate a Stitch-compatible DESIGN.md from existing frontend UI code or user design intent.', artifact: 'DESIGN.md + docs/frontend/DESIGN.md', next: 'api', category: 'workflow' },
  { command: 'api', label: 'API contract', purpose: 'Design or validate contract-first API with auth, errors, pagination, audit, compatibility.', artifact: 'docs/api/api-contract.md', next: 'frontend', category: 'workflow' },
  { command: 'frontend', label: 'Frontend design', purpose: 'Plan page, component, state, API integration, UX states, tests, accessibility.', artifact: 'docs/frontend/frontend-design-and-implementation.md', next: 'backend', category: 'workflow' },
  { command: 'backend', label: 'Backend design', purpose: 'Define services, domain model, transactions, observability, security, tests.', artifact: 'docs/backend/backend-design.md', next: 'springboot', category: 'workflow' },
  { command: 'springboot', label: 'Spring Boot implementation', purpose: 'Generate Java Spring Boot package/layer/test/config plan when Java backend is needed.', artifact: 'docs/backend/springboot-implementation-plan.md', next: 'python', category: 'workflow' },
  { command: 'python', label: 'Python implementation', purpose: 'Generate Python/FastAPI/Flask service plan when Python backend/data service is needed.', artifact: 'docs/backend/python-implementation-plan.md', next: 'data', category: 'workflow' },
  { command: 'data', label: 'Data development', purpose: 'Design source-target mapping, data model, DQ, lineage, audit, serving, SLA.', artifact: 'docs/data/data-development-plan.md', next: 'datacontract', category: 'workflow' },
  { command: 'datacontract', label: 'Data contract', purpose: 'Define owner, SLA, grain, schema, sensitivity, DQ, compatibility, and breaking-change policy.', artifact: 'docs/06-data/contracts/data-contract.md', next: 'sttm', category: 'workflow' },
  { command: 'sttm', label: 'Source-to-target mapping', purpose: 'Map sources to targets with transformations, filters, joins, null handling, DQ, and reconciliation rules.', artifact: 'docs/06-data/sttm/source-to-target-mapping.md', next: 'dbschema', category: 'workflow' },
  { command: 'dbschema', label: 'Database schema', purpose: 'Define tables, types, keys, indexes, partitions, migration, rollback.', artifact: 'docs/data/database-schema-design.md', next: 'sql', category: 'workflow' },
  { command: 'sql', label: 'SQL design', purpose: 'Generate/optimize dialect-aware SQL and performance strategy.', artifact: 'docs/data/sql-design-and-optimization.md', next: 'dq', category: 'workflow' },
  { command: 'dq', label: 'Data quality', purpose: 'Generate executable DQ rules, thresholds, exception handling, and monitoring.', artifact: 'docs/06-data/dq/data-quality-rules.md', next: 'reconcile', category: 'workflow' },
  { command: 'reconcile', label: 'Data reconciliation', purpose: 'Design count, amount, key, duplicate, missing-record, tolerance, and exception controls.', artifact: 'docs/06-data/reconciliation/reconciliation-plan.md', next: 'lineage', category: 'workflow' },
  { command: 'lineage', label: 'Data lineage', purpose: 'Generate table/field lineage, downstream impact, and sensitive-field propagation.', artifact: 'docs/06-data/lineage/lineage-analysis.md', next: 'pipeline', category: 'workflow' },
  { command: 'pipeline', label: 'Data pipeline', purpose: 'Design orchestration, incremental processing, idempotency, backfill, monitoring.', artifact: 'docs/data/data-pipeline-design.md', next: 'scheduler', category: 'workflow' },
  { command: 'scheduler', label: 'Scheduler design', purpose: 'Define DAG dependencies, retries, SLA, resource controls, alerting, and backfill strategy.', artifact: 'docs/06-data/pipeline/scheduler-design.md', next: 'data-test', category: 'workflow' },
  { command: 'data-test', label: 'Data testing', purpose: 'Generate data unit, schema, snapshot, DQ, reconciliation, and regression tests.', artifact: 'docs/06-data/testing/data-test-plan.md', next: 'privacy', category: 'workflow' },
  { command: 'privacy', label: 'Data privacy', purpose: 'Identify PII/SPI, masking, retention, access, audit, and regulatory constraints.', artifact: 'docs/06-data/privacy/data-privacy-assessment.md', next: 'data-review', category: 'workflow' },
  { command: 'data-review', label: 'Data engineering review', purpose: 'Review grain, SQL, DQ, reconciliation, lineage, privacy, scheduler, performance, and runbook readiness.', artifact: 'docs/06-data/review/data-engineering-review.md', next: 'task', category: 'workflow' },
  { command: 'task', label: 'Task breakdown', purpose: 'Split work into implementation-ready stories and dependencies.', artifact: 'docs/tasks/implementation-tasks.md', next: 'test', category: 'workflow' },
  { command: 'test', label: 'Test plan', purpose: 'Create functional, frontend, backend, API, data, regression, and non-functional tests.', artifact: 'docs/test/test-plan.md', next: 'quality', category: 'workflow' },
  { command: 'quality', label: 'Quality gates', purpose: 'Define DoD and gates for product, code, API, data, security, release.', artifact: 'docs/quality/quality-gates.md', next: 'review', category: 'workflow' },
  { command: 'review', label: 'Enterprise review', purpose: 'Review current diff/code against PRD, API, security, tests, and maintainability.', artifact: 'docs/review/code-review-report.md', next: 'diff', category: 'workflow' },
  { command: 'diff', label: 'Impact diff', purpose: 'Compare code diff against PRD/journey/API/tests/release artifacts.', artifact: 'docs/prd/prd-diff-report.md', next: 'release', category: 'workflow' },
  { command: 'release', label: 'Release readiness', purpose: 'Produce release notes, go-live checklist, rollback, monitoring, communication.', artifact: 'docs/release/release-readiness-pack.md', next: 'runbook', category: 'workflow' },
  { command: 'runbook', label: 'Production runbook', purpose: 'Create production operation, rerun, backfill, incident, SLA recovery, and escalation playbooks.', artifact: 'docs/09-runbook/data/data-job-runbook.md', category: 'workflow' }
];

export const TOOL_COMMANDS: WorkflowStep[] = [
  { command: 'story-split', label: 'Ralph story split', purpose: 'Split a PRD or feature into one-iteration, dependency-ordered, verifiable Ralph stories.', artifact: 'docs/prd/ralph-story-split.md', next: 'prd-json', category: 'tool' },
  { command: 'prd-json', label: 'Ralph prd.json converter', purpose: 'Convert PRD Markdown into scripts/ralph/prd.json with passes=false user stories.', artifact: 'docs/prd/ralph-prd-json.md', next: 'ralph-readiness', category: 'tool' },
  { command: 'ralph-readiness', label: 'Ralph readiness review', purpose: 'Check PRD, prd.json, progress.txt, AGENTS.md/CLAUDE.md, quality checks, and story sizes before loop execution.', artifact: 'docs/prd/ralph-readiness-review.md', next: 'loop', category: 'tool' },
  { command: 'skill-init', label: 'Skill registry initialization', purpose: 'Create .product-dev/skills with example skills for prompt quality, bank data engineering, frontend, Spring Boot, and Python.', artifact: '.product-dev/skills/README.md', next: 'skill-scan', category: 'tool' },
  { command: 'skill-scan', label: 'Skill scan', purpose: 'List user-defined local skills and show which commands/triggers they apply to.', artifact: 'docs/skills/skill-scan.md', next: 'skill-review', category: 'tool' },
  { command: 'skill-run', label: 'Skill runner', purpose: 'Run a named custom skill directly against a user task.', artifact: 'docs/skills/<skill>-result.md', next: 'skill-review', category: 'tool' },
  { command: 'skill-review', label: 'Skill review', purpose: 'Review custom skills for metadata, clarity, safety, governance readiness, and missing capabilities.', artifact: 'docs/skills/skill-review.md', next: 'skill-scan', category: 'tool' },
  { command: 'resources-init', label: 'Portable resource initialization', purpose: 'Create standalone prompt and skill resources for Copilot today and OpenCode migration later.', artifact: 'agent-resources/README.md', next: 'resources-scan', category: 'tool' },
  { command: 'resources-scan', label: 'Portable resource scan', purpose: 'Inventory prompt/skill resources, Copilot shims, and OpenCode shims for migration readiness.', artifact: 'docs/agent/portable-resource-scan.md', next: 'skill-scan', category: 'tool' },
  { command: 'prompt', label: 'Prompt optimization', purpose: 'Improve rough prompts into role-aware, context-aware, constrained, output-schema-driven prompts.', artifact: 'docs/tools/prompt-optimization.md', next: 'plan', category: 'tool' },
  { command: 'summarize', label: 'Content summary', purpose: 'Summarize selected text, current document, repository context, or long artifacts into decision-ready notes.', artifact: 'docs/tools/content-summary.md', next: 'doc-review', category: 'tool' },
  { command: 'compress', label: 'Context compression', purpose: 'Compress long context into a compact, loss-minimized briefing for Copilot/Claude/Codex/agent loops.', artifact: 'docs/tools/context-compression.md', next: 'loop', category: 'tool' },
  { command: 'doc-review', label: 'Content / prompt / design review', purpose: 'Review documents, prompts, PRDs, design specs, code plans, SQL, or release notes with structured findings.', artifact: 'docs/tools/review-report.md', next: 'rewrite', category: 'tool' },
  { command: 'rewrite', label: 'Content rewrite', purpose: 'Rewrite or upgrade content for executive, technical, product, banking-grade, or implementation-ready use.', artifact: 'docs/tools/rewrite.md', next: 'doc-review', category: 'tool' },
  { command: 'ui-design', label: 'UI design generator', purpose: 'Generate implementation-ready UI design guidance using DESIGN.md or user design direction.', artifact: 'docs/frontend/ui-design-spec.md', next: 'frontend', category: 'tool' },
  { command: 'checklist', label: 'Checklist generator', purpose: 'Generate execution checklists, review checklists, Definition of Done, handoff checklists, and acceptance checklists.', artifact: 'docs/tools/checklist.md', next: 'quality', category: 'tool' },
  { command: 'nl2sql', label: 'Natural language to SQL', purpose: 'Convert business questions into safe, dialect-aware SQL with validation, DQ, reconciliation, and performance notes.', artifact: 'docs/06-data/sql/nl2sql-result.md', next: 'sql-review', category: 'tool' },
  { command: 'sql-translate', label: 'SQL translation', purpose: 'Translate SQL across Oracle, PostgreSQL, BigQuery, MaxCompute/ODPS, MySQL, SQL Server, Hive, Snowflake, and Databricks.', artifact: 'docs/06-data/sql-translation/sql-translation-report.md', next: 'sql-review', category: 'tool' },
  { command: 'sql-review', label: 'SQL review', purpose: 'Review SQL for correctness, join/grain risk, performance, DQ, reconciliation, privacy, dialect compatibility, and production readiness.', artifact: 'docs/06-data/sql/sql-review-report.md', next: 'data-review', category: 'tool' },
  { command: 'migration', label: 'Data migration', purpose: 'Design DDL/data migration, dual-run, validation, rollback, and release gates.', artifact: 'docs/06-data/migration/data-migration-plan.md', next: 'data-review', category: 'tool' },
  { command: 'catalog', label: 'Data catalog', purpose: 'Generate business glossary, catalog entry, owner, SLA, sensitivity, and usage examples.', artifact: 'docs/06-data/catalog/data-catalog-entry.md', next: 'semantic', category: 'tool' },
  { command: 'semantic', label: 'Semantic layer', purpose: 'Generate metrics, dimensions, join rules, aggregation rules, and agent-readable data card.', artifact: 'docs/06-data/semantic/semantic-layer-design.md', next: 'catalog', category: 'tool' },
  { command: 'cost', label: 'Cost optimization', purpose: 'Optimize scan volume, partitioning, clustering, materialization, compute queues, and storage lifecycle.', artifact: 'docs/06-data/cost/cost-optimization-plan.md', next: 'data-review', category: 'tool' },
];

const allSteps = [...ORDERED_WORKFLOW, ...TOOL_COMMANDS];
const stepByCommand = new Map<ProductDevCommand, WorkflowStep>(allSteps.map(s => [s.command, s]));

export function getWorkflowStep(command: ProductDevCommand): WorkflowStep | undefined {
  return stepByCommand.get(command);
}

export function getNextCommand(command: ProductDevCommand): ProductDevCommand | undefined {
  return getWorkflowStep(command)?.next;
}

export function getNextStepHint(command: ProductDevCommand): string {
  const step = getWorkflowStep(command);
  if (!step) return 'Next: run `@product-dev /plan` to choose the right workflow sequence.';
  if (!step.next) return 'Workflow complete: run `@product-dev /release` again after final code freeze, or `@product-dev /loop-status` if you used looping.';
  const next = getWorkflowStep(step.next);
  return `Next recommended command: \`@product-dev /${step.next}\` — ${next?.purpose ?? 'continue the ordered delivery workflow.'}`;
}

export function renderWorkflowTable(): string {
  const rows = ORDERED_WORKFLOW.map((s, i) => `| ${i + 1} | \`/${s.command}\` | ${s.label} | ${s.purpose} | ${s.artifact} |`).join('\n');
  return `| # | Command | Stage | Purpose | Main Artifact |\n|---:|---|---|---|---|\n${rows}`;
}

export function renderToolCommandTable(): string {
  const rows = TOOL_COMMANDS.map((s, i) => `| ${i + 1} | \`/${s.command}\` | ${s.label} | ${s.purpose} | ${s.artifact} |`).join('\n');
  return `| # | Command | Tool | Purpose | Main Artifact |\n|---:|---|---|---|---|\n${rows}`;
}

export function selectLoopSequence(userPrompt: string): ProductDevCommand[] {
  const text = userPrompt.toLowerCase();
  const wantsDesignMd = text.includes('design.md') || text.includes('design-md') || text.includes('ui design') || text.includes('设计系统') || text.includes('视觉规范');
  const wantsSqlTools = text.includes('nl2sql') || text.includes('自然语言') || text.includes('sql translate') || text.includes('sql转换') || text.includes('sql review') || text.includes('sql评审');
  const wantsTools = text.includes('prompt') || text.includes('提示词') || text.includes('总结') || text.includes('summar') || text.includes('compress') || text.includes('review') || text.includes('检查');
  const prefix: ProductDevCommand[] = wantsTools ? ['prompt', 'summarize'] : [];
  const wantsRalph = text.includes('ralph') || text.includes('prd.json') || text.includes('autonomous') || text.includes('循环') || text.includes('一轮') || text.includes('passes:false');
  if (wantsRalph) {
    return [...prefix, 'resources-scan', 'skill-scan', 'policy-scan', 'scan', 'feature', 'prd', 'story-split', 'prd-json', 'ralph-readiness', 'loop'];
  }
  if (wantsDesignMd) {
    return [...prefix, 'resources-scan', 'skill-scan', 'policy-scan', 'scan', 'design-md', 'ui-design', 'frontend', 'review'];
  }
  if (wantsSqlTools) {
    return [...prefix, 'resources-scan', 'skill-scan', 'policy-scan', 'scan', 'nl2sql', 'sql-review', 'sql-translate', 'dq', 'reconcile', 'lineage', 'data-review'];
  }
  if (text.includes('frontend') || text.includes('react') || text.includes('ui')) {
    return [...prefix, 'policy-scan', 'policy-review', 'scan', 'plan', 'brainstorm', 'feature', 'prd', 'story-split', 'prd-json', 'ralph-readiness', 'journey', 'design-md', 'api', 'frontend', 'task', 'test', 'quality', 'review', 'diff', 'release'];
  }
  if (text.includes('spring') || text.includes('java')) {
    return [...prefix, 'policy-scan', 'policy-review', 'scan', 'plan', 'feature', 'prd', 'story-split', 'prd-json', 'ralph-readiness', 'api', 'springboot', 'task', 'test', 'quality', 'review', 'diff', 'release'];
  }
  if (text.includes('python') || text.includes('fastapi') || text.includes('flask')) {
    return [...prefix, 'policy-scan', 'policy-review', 'scan', 'plan', 'feature', 'prd', 'story-split', 'prd-json', 'ralph-readiness', 'api', 'python', 'task', 'test', 'quality', 'review', 'diff', 'release'];
  }
  if (text.includes('data') || text.includes('sql') || text.includes('postgres') || text.includes('oracle') || text.includes('bigquery') || text.includes('maxcompute') || text.includes('数据') || text.includes('对账') || text.includes('血缘') || text.includes('质量')) {
    return [...prefix, 'policy-scan', 'policy-review', 'scan', 'plan', 'feature', 'prd', 'story-split', 'prd-json', 'ralph-readiness', 'data', 'datacontract', 'sttm', 'dbschema', 'sql', 'dq', 'reconcile', 'lineage', 'pipeline', 'scheduler', 'data-test', 'privacy', 'data-review', 'task', 'test', 'quality', 'review', 'diff', 'release', 'runbook'];
  }
  return [...prefix, 'policy-scan', 'policy-review', 'scan', 'plan', 'brainstorm', 'feature', 'prd', 'story-split', 'prd-json', 'ralph-readiness', 'journey', 'design-md', 'api', 'frontend', 'backend', 'data', 'datacontract', 'sttm', 'dbschema', 'sql', 'dq', 'reconcile', 'lineage', 'pipeline', 'scheduler', 'data-test', 'privacy', 'data-review', 'task', 'test', 'quality', 'review', 'diff', 'release', 'runbook'];
}

export function getWorkflowStageLabel(command: ProductDevCommand): string {
  return getWorkflowStep(command)?.label ?? 'Utility';
}
