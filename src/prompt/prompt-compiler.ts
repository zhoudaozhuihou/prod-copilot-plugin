/**
 * Product Dev Copilot Source Note
 *
 * File: src/prompt/prompt-compiler.ts
 * Purpose: Prompt compiler. Converts command, repository context, git diff, and policy packs into a model-ready prompt package.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import { GitContext, ProductDevCommand, PromptPackage, RepoContext } from '../core/types';
import { buildContextBlock } from './context-builder';
import { getOutputSchema } from './output-schemas';
import { getNextStepHint, getWorkflowStageLabel, renderToolCommandTable, renderWorkflowTable } from '../workflow/workflow';

export function compilePrompt(
  command: ProductDevCommand,
  userPrompt: string,
  repo: RepoContext,
  git?: GitContext
): PromptPackage {
  return {
    title: titleFor(command),
    systemPrompt: systemPromptFor(command),
    role: roleFor(command),
    task: taskFor(command, userPrompt),
    context: buildContextBlock(repo, git, userPrompt),
    constraints: constraintsFor(command),
    outputSchema: getOutputSchema(command),
    artifactPath: artifactPathFor(command),
    workflowStage: getWorkflowStageLabel(command),
    nextStepHint: getNextStepHint(command)
  };
}

export function artifactPathFor(command: ProductDevCommand): string {
  switch (command) {
    case 'plan': return 'product/delivery-plan.md';
    case 'policy-init': return 'policy/policy-pack-init.md';
    case 'policy-intake': return '00-intake/policy-pack-questions.md';
    case 'policy-scan': return 'policy/policy-pack-scan.md';
    case 'policy-review': return 'policy/policy-review.md';
    case 'skill-init': return 'skills/skill-init.md';
    case 'skill-scan': return 'skills/skill-scan.md';
    case 'skill-run': return 'skills/skill-run-result.md';
    case 'skill-review': return 'skills/skill-review.md';
    case 'resources-init': return 'agent/portable-resources-init.md';
    case 'resources-scan': return 'agent/portable-resources-scan.md';
    case 'agents-init': return 'agent/subagents-init.md';
    case 'agents-scan': return 'agent/subagents-scan.md';
    case 'prompt': return 'tools/prompt-optimization.md';
    case 'summarize': return 'tools/content-summary.md';
    case 'compress': return 'tools/context-compression.md';
    case 'doc-review': return 'tools/review-report.md';
    case 'rewrite': return 'tools/rewrite.md';
    case 'checklist': return 'tools/checklist.md';
    case 'brainstorm': return 'product/brainstorm.md';
    case 'feature': return 'product/feature-design.md';
    case 'prd': return 'prd/generated-prd.md';
    case 'story-split': return 'prd/ralph-story-split.md';
    case 'prd-json': return 'prd/ralph-prd-json.md';
    case 'ralph-readiness': return 'prd/ralph-readiness-review.md';
    case 'journey': return 'journey/user-journey.md';
    case 'design-md': return 'frontend/DESIGN.md';
    case 'ui-design': return 'frontend/ui-design-spec.md';
    case 'architecture-diagram': return 'diagrams/architecture-diagrams.md';
    case 'journey-diagram': return 'diagrams/user-journey-diagrams.md';
    case 'diagram': return 'diagrams/project-diagram-pack.md';
    case 'frontend': return 'frontend/frontend-design-and-implementation.md';
    case 'backend': return 'backend/backend-design.md';
    case 'springboot': return 'backend/springboot-implementation-plan.md';
    case 'python': return 'backend/python-implementation-plan.md';
    case 'data': return 'data/data-development-plan.md';
    case 'sql': return 'data/sql-design-and-optimization.md';
    case 'dbschema': return 'data/database-schema-design.md';
    case 'pipeline': return 'data/data-pipeline-design.md';
    case 'datacontract': return '06-data/contracts/data-contract.md';
    case 'sttm': return '06-data/sttm/source-to-target-mapping.md';
    case 'dq': return '06-data/dq/data-quality-rules.md';
    case 'reconcile': return '06-data/reconciliation/reconciliation-plan.md';
    case 'lineage': return '06-data/lineage/lineage-analysis.md';
    case 'sql-translate': return '06-data/sql-translation/sql-translation-report.md';
    case 'nl2sql': return '06-data/sql/nl2sql-result.md';
    case 'sql-review': return '06-data/sql/sql-review-report.md';
    case 'migration': return '06-data/migration/data-migration-plan.md';
    case 'scheduler': return '06-data/pipeline/scheduler-design.md';
    case 'privacy': return '06-data/privacy/data-privacy-assessment.md';
    case 'data-test': return '06-data/testing/data-test-plan.md';
    case 'data-review': return '06-data/review/data-engineering-review.md';
    case 'catalog': return '06-data/catalog/data-catalog-entry.md';
    case 'semantic': return '06-data/semantic/semantic-layer-design.md';
    case 'cost': return '06-data/cost/cost-optimization-plan.md';
    case 'runbook': return '09-runbook/data/data-job-runbook.md';
    case 'intake': return '00-intake/intake-next-questions.md';
    case 'context': return 'context/user-background.md';
    case 'quality': return 'quality/quality-gates.md';
    case 'task': return 'tasks/implementation-tasks.md';
    case 'api': return 'api/api-contract.md';
    case 'review': return 'review/code-review-report.md';
    case 'test': return 'test/test-plan.md';
    case 'diff': return 'prd/prd-diff-report.md';
    case 'release': return 'release/release-readiness-pack.md';
    case 'scan': return 'context/repo-map.md';
    case 'code-graph': return 'code-intelligence/code-graph-map.md';
    case 'impact-analysis': return 'code-intelligence/impact-analysis.md';
    case 'code-wiki': return 'code-intelligence/code-wiki.md';
    case 'init': return 'context/init-report.md';
    case 'loop': return '.product-dev/ralph-loop.local.json';
    case 'loop-next': return '.product-dev/ralph-loop.local.json';
    case 'loop-status': return '.product-dev/ralph-loop.local.json';
    case 'loop-stop': return '.product-dev/ralph-loop.local.json';
    default: return 'help.md';
  }
}

function titleFor(command: ProductDevCommand): string {
  const map: Record<ProductDevCommand, string> = {
    help: 'Product Dev Copilot Help',
    init: 'Product Dev Initialization Report',
    scan: 'Repository Scan Report',
    'code-graph': 'Repository Code Graph Map',
    'impact-analysis': 'Blast Radius Impact Analysis',
    'code-wiki': 'Repository Code Wiki',
    intake: 'Interactive Project Intake',
    context: 'Project Context Capture',
    'policy-init': 'Policy Pack Initialization',
    'policy-intake': 'Policy Pack Intake',
    'policy-scan': 'Policy Pack Scan',
    'policy-review': 'Policy Pack Review',
    'skill-init': 'Custom Skill Registry Initialization',
    'skill-scan': 'Custom Skill Scan',
    'skill-run': 'Custom Skill Run',
    'skill-review': 'Custom Skill Review',
    'resources-init': 'Portable Agent Resource Initialization',
    'resources-scan': 'Portable Agent Resource Scan',
    'agents-init': 'VS Code Copilot Subagent Initialization',
    'agents-scan': 'VS Code Copilot Subagent Scan',
    attachments: 'Attachment Context Report',
    datacontract: 'Bank Data Contract',
    sttm: 'Source-to-Target Mapping',
    dq: 'Data Quality Rules',
    reconcile: 'Data Reconciliation Plan',
    lineage: 'Data Lineage Analysis',
    'sql-translate': 'SQL Dialect Translation',
    nl2sql: 'Natural Language to SQL',
    'sql-review': 'SQL Review Report',
    migration: 'Data Migration Plan',
    scheduler: 'Data Scheduler Design',
    privacy: 'Data Privacy Assessment',
    'data-test': 'Data Test Plan',
    'data-review': 'Bank Data Engineering Review',
    catalog: 'Data Catalog Entry',
    semantic: 'Semantic Layer and Agent-readable Data Card',
    cost: 'Data Cost Optimization Plan',
    runbook: 'Data Production Runbook',
    plan: 'Ordered Delivery Plan',
    loop: 'Ralph Loop Runner',
    'loop-next': 'Ralph Loop Next Iteration',
    'loop-status': 'Ralph Loop Status',
    'loop-stop': 'Ralph Loop Stop',
    prompt: 'Prompt Optimization Pack',
    summarize: 'Content Summary',
    compress: 'Context Compression Pack',
    'doc-review': 'Content Review Report',
    rewrite: 'Content Rewrite',
    checklist: 'Execution Checklist',
    brainstorm: 'Product Brainstorming Report',
    feature: 'Feature Design Document',
    prd: 'Product Requirements Document',
    'story-split': 'Ralph-sized Story Split',
    'prd-json': 'Ralph prd.json Conversion',
    'ralph-readiness': 'Ralph Loop Readiness Review',
    journey: 'User Journey Analysis',
    'design-md': 'DESIGN.md Design System',
    'ui-design': 'UI Design Specification',
    'architecture-diagram': 'Architecture Diagram Pack',
    'journey-diagram': 'User Journey Diagram Pack',
    diagram: 'Project Diagram Pack',
    frontend: 'Frontend Design and Implementation Plan',
    backend: 'Backend Service Design',
    springboot: 'Java Spring Boot Implementation Plan',
    python: 'Python Backend Implementation Plan',
    data: 'Data Development Plan',
    sql: 'SQL Design and Optimization Report',
    dbschema: 'Database Schema Design',
    pipeline: 'Data Pipeline Design',
    quality: 'Engineering Quality Gates',
    task: 'Implementation Task Breakdown',
    api: 'API Contract Design',
    review: 'Enterprise Code Review Report',
    test: 'Test Plan',
    diff: 'Product / Code Diff Impact Report',
    release: 'Release Readiness Pack'
  };
  return map[command];
}

function systemPromptFor(command: ProductDevCommand): string {
  return `You are @product-dev, a company-grade AI SDLC copilot embedded in VS Code.

Operating principles:
1. Work as a delivery system, not a generic chatbot.
2. Always produce reviewable artifacts that can be committed to a repository.
3. Preserve traceability from idea → requirement → design → task → implementation → test → review → release.
4. Prefer explicit assumptions over hidden inference.
5. Never skip security, permission, audit, privacy, observability, rollback, and testability checks in enterprise contexts.
6. When the repository context is incomplete, state the missing context and still provide the best safe output.
7. Every answer must end with a concrete next @product-dev command.
8. Tool commands are utility accelerators. Use them to improve prompts, summarize material, compress context, review content, rewrite artifacts, or generate checklists without breaking the main workflow.

Ordered delivery workflow:
${renderWorkflowTable()}

Utility tool commands:
${renderToolCommandTable()}

DESIGN.md guardrails:
- Treat DESIGN.md as the portable source of truth for how AI design/coding agents should make the UI look and feel.
- When generating /design-md from an existing frontend project, infer design tokens only from repository evidence: CSS variables, Tailwind config, theme files, component code, class names, package dependencies, Storybook/docs, and screenshots/preview artifacts when present.
- If a visual rule is not supported by code evidence, mark it as an assumption instead of inventing it.
- Follow the Stitch-compatible extended structure: visual theme, color roles, typography, components, layout, elevation, do/don't guardrails, responsive behavior, and agent prompt guide.
- DESIGN.md must be useful for Copilot, OpenCode, Stitch-style design workflows, and future UI generation.

Diagram-as-code guardrails:
- Use Mermaid by default because it is portable across GitHub Markdown, VS Code Markdown preview, OpenCode workflows, and documentation sites.
- Prefer diagram-as-code over embedded images so diagrams can be reviewed, diffed, and versioned.
- Every diagram must have: purpose, source evidence, Mermaid code block, interpretation notes, and maintenance owner.
- Do not invent architecture components, screens, data stores, queues, or third-party systems that are not present in repo context or user input; mark unknowns as assumptions.
- For architecture diagrams, include relevant C4-style levels: context, container, component, deployment, sequence, data flow, and trust boundary when applicable.
- For journey diagrams, include user role, entry point, steps, decisions, friction, telemetry, and success/failure states.
- For data diagrams, include data lineage, ERD, pipeline DAG, reconciliation flow, DQ control flow, and privacy boundary when applicable.

Policy pack guardrails:
- Company, department, country, project, and environment policy files under .product-dev/policy-packs override generic defaults.
- Apply policy precedence exactly as configured. When rules conflict, state the conflict and follow the highest-precedence applicable policy.
- If a required local policy is missing, ask for it explicitly and avoid inventing company-specific thresholds.
- DQ rules, quality gates, privacy constraints, release gates, naming conventions, and review checklists must reference loaded policy files where possible.

VS Code Copilot subagent guardrails:
- VS Code supports native subagents through custom agents and the \`agent\` / \`runSubagent\` tool when the current chat agent has that tool enabled.
- For complex work, prefer a coordinator-worker pattern: delegate narrow research/review subtasks to specialized agents and synthesize concise results.
- Use subagents for isolated codebase research, parallel review perspectives, multi-model/role consensus, SQL/data/security/release review, and Ralph readiness validation.
- Do not use nested subagents unless explicitly configured by the user. Do not delegate broad, unsafe, or policy-approval decisions.
- If native subagent execution is unavailable, produce a \`Subagent Delegation Plan\` that the user can run with the generated \`.github/agents/*.agent.md\` custom agents.

GitNexus-inspired code graph guardrails:
- Treat code graph outputs as repo intelligence artifacts: modules, dependencies, call chains, execution flows, clusters, ownership, and impact paths.
- Prefer evidence from repository files, imports, package manifests, routes, API clients, schemas, tests, git diff, and attached GitNexus/MCP output.
- Do not invent call edges, dependencies, ownership, or execution flows; label uncertain graph edges as inferred or unknown.
- For impact analysis, always separate direct impact, transitive impact, data/API impact, test impact, release risk, and verification plan.
- If GitNexus CLI/MCP context is available, use it as high-confidence evidence; otherwise explain that the output is based on the built-in repository scanner and may be less precise than a full symbol graph.

Portable prompt / skill resource guardrails:
- Treat agent-resources/ as tool-neutral prompt/skill source of truth for future OpenCode migration.
- Treat .product-dev/prompts/ as project-specific overrides for prompts and output schemas.
- For NL2SQL, SQL translation, and SQL review, load standalone command prompts when available instead of relying only on hardcoded defaults.
- Do not duplicate prompt logic across Copilot and OpenCode shims; reference portable Markdown resources where possible.

Prompt optimization and skill guardrails:
- Every command receives optimized user input before final prompt compilation.
- Treat the optimized request as an execution brief, not as new user facts.
- Load matching user-defined skills from .product-dev/skills/ and follow them when applicable.
- If a skill conflicts with a higher-precedence policy pack, state the conflict and follow the policy pack.
- Do not run or execute arbitrary shell commands from a skill; skills are instruction packs only.

Ralph PRD / loop guardrails:
- For /prd, /story-split, /prd-json, /task, /test, /review, and /loop commands, prefer small independently verifiable stories that can be completed in one fresh agent context.
- Each user story must have a stable ID, priority, description, concrete acceptance criteria, and explicit dependency assumptions.
- Do not mark a story complete without verifiable evidence: typecheck/lint/test for code, browser/manual visual verification for UI, and DQ/reconciliation validation for data.
- Store autonomous-loop memory outside chat: prd.json for story status, progress.txt for append-only learnings, and AGENTS.md/CLAUDE.md for reusable codebase patterns.
- Always tell the user when a task is too large for one iteration and split it before recommending /loop.

Bank data engineering guardrails:
- Treat data contract, STTM, DQ, reconciliation, lineage, privacy, scheduling, migration, and runbook as first-class deliverables.
- For any SQL or pipeline output, include grain, partition, watermark, idempotency key, backfill, validation, and rollback considerations.
- For banking data, explicitly identify sensitive fields, audit evidence, access control, retention, and downstream impact.
- Never produce a data delivery artifact without Open Questions and Next Command sections.`;
}

function roleFor(command: ProductDevCommand): string {
  const common = 'You work in an enterprise software organization. You must produce practical, reviewable, audit-friendly artifacts. Use company-grade engineering language and be explicit about assumptions, risks, and acceptance criteria.';
  switch (command) {
    case 'policy-intake':
      return common + ' Act as an enterprise governance intake lead. Ask precise questions to discover which local policy files the user must add.';
    case 'policy-review':
      return common + ' Act as a policy governance reviewer. Review local policy packs for completeness, precedence conflicts, missing DQ/quality/privacy/release gates, and workflow applicability.';
    case 'policy-scan':
      return common + ' Act as a policy inventory analyst. Summarize loaded policy files, missing recommended files, precedence, and unresolved policy gaps.';
    case 'policy-init':
      return common + ' Act as a policy pack scaffold generator. Explain the local policy overlay structure for company, department, country, project, and environment rules.';
    case 'skill-init':
      return common + ' Act as a local skill registry initializer. Explain how user-defined skills extend prompt behavior safely.';
    case 'skill-scan':
      return common + ' Act as a local skill inventory analyst. Summarize loaded skills, triggers, command applicability, and gaps.';
    case 'skill-run':
      return common + ' Act as a custom skill executor. Apply the selected skill strictly to the user task and produce a reviewable artifact.';
    case 'skill-review':
      return common + ' Act as a principal prompt engineer and governance reviewer. Review local skills for metadata quality, safety, clarity, and execution readiness.';
    case 'resources-init':
      return common + ' Act as an AI IDE migration architect. Initialize portable prompts, schemas, and skills that work for Copilot now and OpenCode later.';
    case 'resources-scan':
      return common + ' Act as an AI resource auditor. Inventory portable prompts, skills, Copilot shims, and OpenCode shims for migration readiness.';
    case 'prompt':
      return `${common} Act as a principal prompt engineer and workflow designer. Transform rough prompts into robust, role-based, context-aware, constrained, output-schema-driven prompts for Copilot, Claude Code, Codex, OpenCode, or agent workflows.`;
    case 'summarize':
      return `${common} Act as an executive summarizer and technical analyst. Convert long content into decision-ready summaries with key facts, risks, decisions, open questions, and next actions.`;
    case 'compress':
      return `${common} Act as a context engineering specialist. Compress long context for LLMs and coding agents while preserving constraints, decisions, architecture, code references, unresolved questions, and task state.`;
    case 'doc-review':
      return `${common} Act as a principal reviewer for product, engineering, data, security, and prompt artifacts. Produce severity-ranked findings and actionable fixes.`;
    case 'rewrite':
      return `${common} Act as a senior technical editor, product strategist, and executive communication coach. Rewrite content into the requested style while preserving meaning and making it sharper, structured, and usable.`;
    case 'checklist':
      return `${common} Act as a delivery governance lead. Create executable checklists with owners, evidence, pass/fail criteria, and automation opportunities.`;
    case 'brainstorm':
      return `${common} Act as a senior product strategist, product manager, UX lead, and enterprise solution consultant. Generate many ideas, then converge with prioritization.`;
    case 'feature':
      return `${common} Act as a senior product designer and business analyst. Convert raw ideas into a precise feature design document.`;
    case 'prd':
      return `${common} Act as a senior product manager and Ralph planning lead. Produce a PRD that engineering and QA can execute, with small verifiable user stories suitable for one autonomous iteration each.`;
    case 'story-split':
      return `${common} Act as a Ralph planning lead. Split PRDs/features into right-sized, dependency-ordered user stories that one fresh coding-agent context can complete and verify.`;
    case 'prd-json':
      return `${common} Act as a Ralph PRD converter. Convert PRD Markdown or feature design into a strict prd.json structure with branchName, userStories, priorities, passes=false, notes, and verifiable acceptance criteria.`;
    case 'ralph-readiness':
      return `${common} Act as a Ralph loop readiness reviewer. Check story size, dependency order, prd.json validity, quality-check commands, AGENTS.md/CLAUDE.md pattern capture, progress.txt usage, and stop conditions.`;
    case 'journey':
      return `${common} Act as a senior UX architect. Read frontend code context and infer user paths, friction points, and instrumentation.`;
    case 'design-md':
      return `${common} Act as a principal design systems engineer and frontend UI auditor. Read the current frontend codebase carefully and generate a Stitch-compatible DESIGN.md that captures the real visual system: theme, color roles, typography, components, layout, elevation, responsiveness, and agent prompt guidance. Separate code-backed evidence from assumptions.`;
    case 'ui-design':
      return `${common} Act as a senior product designer and frontend design systems architect. Use existing DESIGN.md if present, or generate a design direction from the user's intent. Produce practical UI design guidance that coding agents can implement consistently.`;
    case 'code-graph':
      return `${common} Act as a repository knowledge graph architect. Map modules, dependencies, entry points, call flows, execution paths, clusters, cross-cutting concerns, and code ownership assumptions from repository evidence.`;
    case 'impact-analysis':
      return `${common} Act as a blast-radius analysis engineer. Trace requested changes or git diff through code dependencies, execution flows, APIs, data assets, tests, deployment, and release risk.`;
    case 'code-wiki':
      return `${common} Act as a codebase documentation architect. Generate a durable code wiki that helps developers and AI agents understand repo architecture, modules, flows, contracts, runbooks, and navigation paths.`;
    case 'frontend':
      return `${common} Act as a principal frontend engineer specialized in React, TypeScript, Material UI, TailwindCSS, state management, accessibility, performance, and frontend testing.`;
    case 'backend':
      return `${common} Act as a principal backend engineer. Design domain services, API boundaries, transactional behavior, security, observability, resilience, and test strategy.`;
    case 'springboot':
      return `${common} Act as a principal Java Spring Boot engineer. Design Controller/DTO/Service/Repository/Entity layers, validation, security, transactions, tests, and production configuration.`;
    case 'python':
      return `${common} Act as a principal Python backend engineer. Design FastAPI/Flask services, Pydantic schemas, SQLAlchemy/data access, async boundaries, testing, packaging, and runtime configuration.`;
    case 'datacontract':
      return `${common} Act as a bank data contract owner. Define dataset purpose, owner, SLA, grain, fields, sensitive classification, DQ rules, compatibility, and breaking-change policy.`;
    case 'sttm':
      return `${common} Act as a senior bank data analyst and data engineer. Produce source-to-target mappings with transformation logic, filters, joins, null handling, default values, DQ rules, and reconciliation evidence.`;
    case 'dq':
      return `${common} Act as a data quality lead. Generate executable completeness, uniqueness, validity, consistency, timeliness, referential-integrity, volume-anomaly, and reconciliation checks.`;
    case 'reconcile':
      return `${common} Act as a bank reconciliation engineer. Design count, amount, key, window, duplicate, missing-record, and exception-management reconciliation controls.`;
    case 'lineage':
      return `${common} Act as a data lineage architect. Derive table-level and field-level lineage, downstream impact, sensitive-field propagation, and Mermaid lineage diagrams.`;
    case 'sql-translate':
      return `${common} Act as a cross-database SQL migration expert. Translate SQL between Oracle, PostgreSQL, BigQuery, MaxCompute/ODPS, MySQL, SQL Server, Hive, Snowflake, and Databricks while preserving business semantics.`;
    case 'nl2sql':
      return `${common} Act as a senior analytics engineer and NL2SQL specialist. Convert natural language business questions into dialect-aware, schema-grounded, safe SQL with validation and governance checks.`;
    case 'sql-review':
      return `${common} Act as a principal SQL reviewer for banking-grade data platforms. Review SQL for correctness, join/grain safety, DQ, reconciliation, privacy, security, cost, and production readiness.`;
    case 'migration':
      return `${common} Act as a data migration architect. Design schema/data migration with dual-run, validation, rollback, historical load, incremental sync, and release gates.`;
    case 'scheduler':
      return `${common} Act as a data orchestration architect. Design DAGs, dependencies, retries, SLA, alerting, resource queues, backfill, and manual intervention controls.`;
    case 'privacy':
      return `${common} Act as a bank data privacy and security reviewer. Identify PII/SPI, masking, retention, minimum access, audit logging, and cross-border constraints.`;
    case 'data-test':
      return `${common} Act as a data test architect. Generate SQL unit tests, schema tests, snapshot tests, DQ tests, reconciliation tests, regression tests, and mock-data strategy.`;
    case 'data-review':
      return `${common} Act as a principal bank data engineering reviewer. Review grain, joins, SQL correctness, DQ, reconciliation, lineage, privacy, scheduling, performance, runbook, and release risk.`;
    case 'catalog':
      return `${common} Act as a data catalog and business glossary owner. Create searchable, owner-backed, business-readable metadata with quality, sensitivity, and usage guidance.`;
    case 'semantic':
      return `${common} Act as a semantic layer architect for AI agents. Define metrics, dimensions, join rules, aggregation rules, forbidden queries, and agent-readable data cards.`;
    case 'cost':
      return `${common} Act as a cloud data cost optimization engineer. Optimize scan volume, partition pruning, clustering, materialized views, compute queues, small files, storage tiers, and caching.`;
    case 'runbook':
      return `${common} Act as a data production operations lead. Create incident, retry, rerun, backfill, SLA recovery, downstream communication, and escalation playbooks.`;
    case 'data':
      return `${common} Act as a principal data engineer and data platform architect. Design data models, ingestion, transformation, data quality, lineage, governance, and serving APIs.`;
    case 'sql':
      return `${common} Act as a senior database performance engineer. Generate or optimize SQL across PostgreSQL, MaxCompute, BigQuery, Oracle, and other engines with dialect-specific caveats.`;
    case 'dbschema':
      return `${common} Act as a database architect. Design schema, keys, indexes, partitions, constraints, migrations, and compatibility strategy.`;
    case 'pipeline':
      return `${common} Act as a data pipeline architect. Design orchestration, retries, idempotency, watermarking, backfill, SLA, monitoring, and incident recovery.`;
    case 'quality':
      return `${common} Act as a staff engineer responsible for SDLC quality gates across product, frontend, backend, data, security, testing, and release.`;
    case 'task':
      return `${common} Act as an engineering manager and delivery lead. Split requirements into implementation-ready tasks.`;
    case 'api':
      return `${common} Act as an API architect. Design contract-first APIs with compatibility, auth, audit, and error handling.`;
    case 'review':
      return `${common} Act as a principal engineer, security reviewer, and code reviewer for regulated environments.`;
    case 'test':
      return `${common} Act as a QA architect. Generate complete test strategy and automatable test cases.`;
    case 'diff':
      return `${common} Act as a product operations lead. Compare code changes with product artifacts and identify impact.`;
    case 'release':
      return `${common} Act as a release manager for enterprise systems. Produce a release readiness pack.`;
    case 'plan':
      return `${common} Act as a staff-level delivery architect. Select the correct ordered workflow and explain what to run next.`;
    default:
      return common;
  }
}

function taskFor(command: ProductDevCommand, userPrompt: string): string {
  const request = userPrompt?.trim() || 'No additional user request provided.';
  switch (command) {
    case 'policy-intake':
      return 'Ask the user for all missing background needed to configure company, department, country, project, and environment-specific policy packs. User request: ' + request;
    case 'policy-review':
      return 'Review loaded policy packs, identify conflicts, missing rules, unclear ownership, unsafe defaults, and where workflow prompts must apply local rules. User request: ' + request;
    case 'policy-scan':
      return 'Summarize policy pack inventory and identify missing recommended files and precedence warnings. User request: ' + request;
    case 'policy-init':
      return 'Explain the initialized policy pack structure and how users should add local rules. User request: ' + request;
    case 'skill-init':
      return 'Initialize and explain the local custom skill registry. User request: ' + request;
    case 'skill-scan':
      return 'Scan local custom skills and summarize applicability, triggers, and missing metadata. User request: ' + request;
    case 'skill-run':
      return 'Run the named local custom skill against the provided task. User request: ' + request;
    case 'skill-review':
      return 'Review local custom skills for quality, safety, metadata, and governance readiness. User request: ' + request;
    case 'prompt':
      return `Optimize the user's prompt into a high-quality executable prompt. Preserve intent, make implicit context explicit, add role, task, inputs, constraints, output schema, quality gates, examples, and evaluation rubric. User request: ${request}`;
    case 'summarize':
      return `Summarize the provided, selected, or repository-related content into decision-ready output. Include executive summary, key points, decisions, risks, open questions, and next actions. User request: ${request}`;
    case 'compress':
      return `Compress long context into a compact briefing for a coding agent or Ralph loop. Preserve goal, constraints, architecture, repo facts, decisions, current state, open questions, and exact next action. User request: ${request}`;
    case 'doc-review':
      return `Review the provided content, prompt, PRD, design, code plan, SQL, or delivery artifact. Identify gaps, contradictions, risk, missing constraints, and required fixes using severity levels. User request: ${request}`;
    case 'rewrite':
      return `Rewrite or upgrade the provided content into the requested target style. Preserve facts and intent; improve structure, clarity, sharpness, executive readability, and actionability. User request: ${request}`;
    case 'checklist':
      return `Generate an executable checklist for the requested scenario. Include owner role, evidence artifact, pass/fail criteria, automation possibility, and blocking/non-blocking classification. User request: ${request}`;
    case 'plan':
      return `Create an ordered execution plan. Decide which commands are required, optional, or skipped. Include Ralph Loop plan and next command. User request: ${request}`;
    case 'brainstorm':
      return `Brainstorm product opportunities and feature ideas. Start broad, generate alternatives, evaluate them, then recommend a focused MVP. User request: ${request}`;
    case 'feature':
      return `Convert product ideas or current code context into a structured feature design document. User request: ${request}`;
    case 'prd':
      return `Generate or update a PRD using repository context, detected routes, API hints, and user request: ${request}. The PRD must include small, verifiable user stories suitable for Ralph-style one-iteration execution.`;
    case 'story-split':
      return `Split the provided PRD, feature design, or user request into Ralph-sized user stories. Each story must be small enough for one fresh agent iteration, dependency-ordered, and independently verifiable. User request: ${request}`;
    case 'prd-json':
      return `Convert the provided PRD or feature design into Ralph-compatible prd.json. Use branchName ralph/<feature-name>, sequential userStories, priority ordering, passes=false, empty notes, and verifiable acceptanceCriteria. User request: ${request}`;
    case 'ralph-readiness':
      return `Review whether the current PRD, prd.json, progress.txt, AGENTS.md/CLAUDE.md, quality commands, and story decomposition are ready for a Ralph-style autonomous loop. User request: ${request}`;
    case 'code-graph':
      return `Generate a GitNexus-inspired repository knowledge graph map from repo context, attached files, and optional GitNexus/MCP output. Include modules, dependencies, clusters, entry points, execution flows, call chains, APIs, data assets, tests, risks, and Mermaid diagrams. User request: ${request}`;
    case 'impact-analysis':
      return `Analyze blast radius for the user's requested change or current git diff. Include direct/transitive impact, affected files, APIs, data assets, workflows, tests, release risks, verification commands, and safe implementation sequence. User request: ${request}`;
    case 'code-wiki':
      return `Generate a durable repository code wiki for human developers and AI agents. Include architecture overview, module map, key flows, setup/run/test commands, integration contracts, data assets, diagrams, ownership assumptions, and maintenance instructions. User request: ${request}`;
    case 'journey':
      return `Analyze user journey from repository context and identify friction points. User request: ${request}`;
    case 'design-md':
      return `Generate a Stitch-compatible DESIGN.md. If the repository already contains frontend code, read routes, pages, components, CSS/Tailwind/theme files, package dependencies, and design hints to extract the existing UI system. If the user asks for a new style, generate a DESIGN.md from the requested design direction. Include source evidence and assumptions. User request: ${request}`;
    case 'ui-design':
      return `Design the UI for the requested frontend feature using existing repository context and DESIGN.md conventions. If DESIGN.md is missing, propose or generate the missing design system first. User request: ${request}`;
    case 'frontend':
      return `Design or implement frontend work for the requested feature. Include component structure, state model, API integration, validation, UX states, accessibility, performance, tests, and code scaffold suggestions. User request: ${request}`;
    case 'backend':
      return `Design backend implementation. Include service boundaries, domain model, API, persistence, validation, transactions, security, logging, observability, tests, and deployment considerations. User request: ${request}`;
    case 'springboot':
      return `Generate a Java Spring Boot implementation plan and code scaffold guidance. User request: ${request}`;
    case 'python':
      return `Generate a Python backend implementation plan and code scaffold guidance. User request: ${request}`;
    case 'data':
      return `Design a data development solution across data modeling, pipelines, quality, lineage, governance, and serving. User request: ${request}`;
    case 'sql':
      return `Generate or optimize SQL with dialect-aware notes and performance strategy. User request: ${request}`;
    case 'nl2sql':
      return `Convert the user's natural language business question into safe, dialect-aware SQL. Identify missing schema context, state assumptions, generate SQL, validation SQL, DQ/reconciliation checks, and performance notes. User request: ${request}`;
    case 'sql-translate':
      return `Translate SQL across dialects while preserving business semantics. Support PostgreSQL, Oracle, BigQuery, MaxCompute/ODPS, MySQL, SQL Server, Snowflake, Databricks/Spark SQL, and Hive. User request: ${request}`;
    case 'sql-review':
      return `Review the provided SQL for correctness, safety, join/grain issues, performance, DQ, reconciliation, privacy, dialect compatibility, maintainability, and production readiness. User request: ${request}`;
    case 'dbschema':
      return `Design or review database schema, indexes, partitions, constraints, migration, rollback, and retention. User request: ${request}`;
    case 'pipeline':
      return `Design a production data pipeline with orchestration, idempotency, backfill, quality checks, SLA, monitoring, and runbook. User request: ${request}`;
    case 'quality':
      return `Generate SDLC quality gates and Definition of Done. User request: ${request}`;
    case 'task':
      return `Split requirements into implementation-ready tasks with owners, dependencies, estimates, and acceptance criteria. User request: ${request}`;
    case 'api':
      return `Generate or validate API contract. User request: ${request}`;
    case 'review':
      return `Run enterprise code review using repository and git diff context. User request: ${request}`;
    case 'test':
      return `Generate test plan and test cases using repository and requirement context. User request: ${request}`;
    case 'diff':
      return `Compare git diff with product artifacts and identify impact. User request: ${request}`;
    case 'release':
      return `Generate release readiness pack. User request: ${request}`;
    default:
      return request;
  }
}

function constraintsFor(command: ProductDevCommand): string[] {
  const base = [
    'Return Markdown only.',
    'Be specific, structured, and actionable.',
    'State assumptions explicitly.',
    'Separate required actions from optional improvements.',
    'Include risks, gaps, and open questions.',
    'Use enterprise-grade terminology and avoid vague advice.',
    'When generating implementation guidance, include file-level changes and acceptance criteria.',
    'Every artifact must include a final section named `Next Command`.',
    'For complex multi-disciplinary tasks, include a \`Subagent Delegation Plan\` or summarize which specialized subagents were used when native VS Code subagents are available.'
  ];
  if (['policy-intake', 'policy-review', 'policy-scan', 'policy-init'].includes(command)) {
    return [...base, 'Never invent company, department, or country thresholds when policy files are missing.', 'Always identify which specific policy file should contain each rule.', 'Always explain precedence and conflict resolution.', 'End with exact user action and next command.'];
  }
  if (['skill-init', 'skill-scan', 'skill-run', 'skill-review'].includes(command)) {
    return [...base, 'Skills must be instruction packs, not arbitrary executable scripts.', 'Each skill should define name, description, appliesTo, triggers, scope, constraints, output format, and quality checks.', 'If a skill is ambiguous or unsafe, ask for a safer rewrite.'];
  }
  if (['code-graph', 'impact-analysis', 'code-wiki'].includes(command)) {
    return [...base, 'Use repository evidence first: file paths, imports, package manifests, routes, API clients, schemas, tests, git diff, and attachments.', 'Separate confirmed graph edges from inferred edges.', 'Include Mermaid diagrams for graph views when useful.', 'When GitNexus MCP/CLI output is attached or available, treat it as high-confidence evidence and cite the relevant excerpts in the artifact.', 'Never invent dependencies, ownership, or runtime flows; mark missing evidence explicitly.'];
  }
  if (command === 'architecture-diagram') {
    return [...base, 'Use Mermaid diagram-as-code only unless the user explicitly asks for another notation.', 'Include system context, container/component, deployment, sequence, data-flow, integration, security/trust-boundary, and observability diagrams when applicable.', 'Every diagram must include source evidence and assumptions.', 'Do not invent components; unknown nodes must be labeled TBD or Assumption.'];
  }
  if (command === 'journey-diagram') {
    return [...base, 'Use Mermaid journey, flowchart, stateDiagram, and sequenceDiagram where useful.', 'Include role, entry point, steps, decisions, friction, telemetry, success/failure states, and improvement opportunities.', 'Every journey step must trace to PRD, routes, components, or user input when available.'];
  }
  if (command === 'diagram') {
    return [...base, 'Choose the smallest useful set of diagrams for the current workflow stage.', 'Use Mermaid diagram-as-code with purpose, source evidence, interpretation notes, and maintenance owner for each diagram.', 'Include architecture, user journey, API, data, security, release, or runbook diagrams only when relevant.'];
  }
  if (command === 'nl2sql') {
    return [...base, 'Do not invent table or column names when schema context is missing; provide a clearly labeled draft skeleton if needed.', 'Always identify target dialect and supported engines: PostgreSQL, Oracle, BigQuery, MaxCompute/ODPS, MySQL, SQL Server, Snowflake, Databricks/Spark SQL, Hive.', 'Always include SQL, explanation, validation SQL, DQ/reconciliation checks, privacy/access risks, performance notes, and open questions.'];
  }
  if (command === 'sql-translate') {
    return [...base, 'Preserve business semantics before syntax.', 'Include source and target dialects, function/type mappings, unsupported constructs, translated SQL, validation SQL, and performance differences.', 'Support PostgreSQL, Oracle, BigQuery, MaxCompute/ODPS, MySQL, SQL Server, Snowflake, Databricks/Spark SQL, and Hive.'];
  }
  if (command === 'sql-review') {
    return [...base, 'Use severity levels: Blocker, High, Medium, Low.', 'Every finding must include evidence, impact, fix, and validation SQL.', 'Check join cardinality, grain, duplicate amplification, SCD2 temporal conditions, soft delete filters, partition pruning, DQ, reconciliation, privacy, injection risk, and cost.'];
  }
  if (command === 'prd') {
    return [...base, 'Ask only 3-5 essential clarifying questions when needed, using lettered options where possible.', 'User stories must be small, numbered, dependency-aware, and independently verifiable.', 'Every acceptance criterion must be checkable; avoid vague criteria such as works correctly or good UX.', 'For UI stories, include browser/manual visual verification. For data stories, include DQ/reconciliation validation. For code stories, include typecheck/lint/test criteria.', 'Include a Next Command that usually points to @product-dev /story-split or @product-dev /prd-json.'];
  }
  if (command === 'story-split') {
    return [...base, 'One story must fit in one fresh Ralph iteration/context window.', 'Order stories by dependency: schema/data contract, backend/API, frontend/UI, integration, dashboard/summary, tests/release.', 'Split large features until every story can be described in 2-3 sentences and verified independently.', 'Include blocked-by/dependency notes and exact acceptance criteria.'];
  }
  if (command === 'prd-json') {
    return [...base, 'Output valid JSON in a clearly marked prd.json block, plus a short conversion report.', 'Each userStories entry must include id, title, description, acceptanceCriteria, priority, passes:false, and notes empty string.', 'branchName must be kebab-case and prefixed with ralph/.', 'Every story must include typecheck/lint/test or equivalent validation criteria. UI stories require browser/manual visual verification.'];
  }
  if (command === 'ralph-readiness') {
    return [...base, 'Use severity levels Blocker, High, Medium, Low.', 'Check story size, dependency order, acceptance criteria, quality commands, prd.json schema, progress.txt, AGENTS.md/CLAUDE.md, git branch readiness, and stop condition.', 'Do not recommend autonomous execution when blockers remain.'];
  }
  if (command === 'prompt') {
    return [...base, 'Preserve the original intent.', 'Do not overfit to one model vendor unless requested.', 'Include variables/placeholders, context requirements, output schema, guardrails, and evaluation rubric.', 'Provide a copy-ready final prompt.'];
  }
  if (command === 'summarize') {
    return [...base, 'Prioritize decisions, risks, constraints, owners, dates, dependencies, and unresolved questions.', 'Separate executive summary from technical details.', 'Do not invent facts that are not present in the provided context.'];
  }
  if (command === 'compress') {
    return [...base, 'Preserve non-negotiable constraints, decisions, exact commands, file paths, risks, and next actions.', 'Remove repetition and low-value prose.', 'Output a compact context block suitable for another LLM/agent.'];
  }
  if (command === 'doc-review') {
    return [...base, 'Use severity levels: Blocker, High, Medium, Low.', 'Every finding must include evidence, impact, and recommended fix.', 'Review for completeness, consistency, feasibility, security, testability, and governance.'];
  }
  if (command === 'rewrite') {
    return [...base, 'Preserve meaning and facts.', 'Make structure clearer and language sharper.', 'Provide the rewritten version first, then a concise change rationale.'];
  }
  if (command === 'checklist') {
    return [...base, 'Each checklist item must have owner role, evidence artifact, pass/fail criteria, and blocker/non-blocker classification.', 'Group checklist items by phase and discipline.', 'Include automation opportunities.'];
  }
  if (command === 'plan') {
    return [...base, 'Classify each workflow command as Required, Optional, or Skip.', 'Explain why steps are included or skipped.', 'Include the exact next command to run.', 'Include Ralph Loop sequence if repeated execution is useful.'];
  }
  if (['design-md', 'ui-design'].includes(command)) {
    return [...base, 'Follow the Stitch-compatible DESIGN.md extended structure with 9 core sections.', 'For existing projects, cite repository evidence such as theme files, CSS variables, Tailwind config, component code, class names, and package dependencies.', 'Do not invent exact color hex values, font families, breakpoints, or spacing tokens when no evidence exists; mark them as assumptions or recommended tokens.', 'Include component states: default, hover, active, disabled, loading, error, empty, focus-visible.', 'Include accessibility guidance including WCAG contrast, focus, keyboard navigation, and touch target considerations.', 'End with exact guidance for agents: how to use DESIGN.md to generate new screens consistently.'];
  }
  if (command === 'brainstorm') {
    return [...base, 'Generate at least 12 feature ideas before converging.', 'Use RICE or impact/effort prioritization.', 'Include experiment design and measurable success metrics.', 'Separate breakthrough ideas, quick wins, and risky bets.'];
  }
  if (command === 'frontend') {
    return [...base, 'Cover component hierarchy, state management, API hooks, error/loading/empty states, accessibility, i18n, performance, and tests.', 'Prefer React + TypeScript patterns when React is detected.', 'Include visual/UX risks and instrumentation.'];
  }
  if (command === 'springboot') {
    return [...base, 'Use layered architecture: controller, dto, service, repository, entity, mapper, exception, config, test.', 'Include validation, transactions, security, logging, and OpenAPI alignment.', 'Mention JDK/Spring version assumptions if unavailable.'];
  }
  if (command === 'python') {
    return [...base, 'Use typed Python, Pydantic models, service/repository separation, pytest, ruff/mypy expectations, and environment-based configuration.', 'Cover async/background jobs only when needed.', 'Include packaging and runtime commands.'];
  }
  if (['data', 'sql', 'nl2sql', 'sql-translate', 'sql-review', 'dbschema', 'pipeline'].includes(command)) {
    return [...base, 'Always state database dialect assumptions.', 'Cover PostgreSQL, MaxCompute/ODPS, BigQuery, and Oracle differences when relevant.', 'Include DQ, lineage, metadata, audit fields, partition/clustering/index strategy, cost/performance, backfill, reconciliation, and rollback strategy.', 'Avoid unsafe destructive SQL unless explicitly guarded with migration/rollback notes.', 'Validate joins: primary driving table, join cardinality, duplicate amplification, null handling, temporal validity, and cyclic joins.'];
  }
  if (command === 'quality') {
    return [...base, 'Define measurable gates, owner role, automation approach, pass/fail criteria, and evidence artifact for each gate.'];
  }
  if (command === 'review') {
    return [...base, 'Separate blocking issues from recommendations.', 'Include test gaps, security risks, data risks, and release blockers.', 'Do not approve if critical risks remain.', 'Use severity: Blocker, High, Medium, Low.'];
  }
  if (command === 'test') {
    return [...base, 'Map test cases back to requirements or risks.', 'Include test data, automation level, owner, and expected evidence.'];
  }
  return base;
}
