/**
 * Product Dev Copilot Source Note
 *
 * File: src/chat/command-router.ts
 * Purpose: Slash command router. Keeps package.json command names aligned with TypeScript handlers.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import { CommandArgs, ProductDevCommand } from '../core/types';
import { runApiCommand } from '../commands/api.command';
import { runBackendCommand } from '../commands/backend.command';
import { runBrainstormCommand } from '../commands/brainstorm.command';
import { runChecklistCommand } from '../commands/checklist.command';
import { runCompressCommand } from '../commands/compress.command';
import { runDataCommand } from '../commands/data.command';
import { runDbschemaCommand } from '../commands/dbschema.command';
import { runDiffCommand } from '../commands/diff.command';
import { runDocReviewCommand } from '../commands/doc-review.command';
import { runFeatureCommand } from '../commands/feature.command';
import { runFrontendCommand } from '../commands/frontend.command';
import { runDesignMdCommand } from '../commands/design-md.command';
import { runArchitectureDiagramCommand } from '../commands/architecture-diagram.command';
import { runJourneyDiagramCommand } from '../commands/journey-diagram.command';
import { runDiagramCommand } from '../commands/diagram.command';
import { runInitCommand } from '../commands/init.command';
import { runJourneyCommand } from '../commands/journey.command';
import { runLoopCommand } from '../commands/loop.command';
import { runLoopNextCommand } from '../commands/loop-next.command';
import { runLoopStatusCommand } from '../commands/loop-status.command';
import { runLoopStopCommand } from '../commands/loop-stop.command';
import { runPipelineCommand } from '../commands/pipeline.command';
import { runPlanCommand } from '../commands/plan.command';
import { runPrdCommand } from '../commands/prd.command';
import { runStorySplitCommand } from '../commands/story-split.command';
import { runPrdJsonCommand } from '../commands/prd-json.command';
import { runRalphReadinessCommand } from '../commands/ralph-readiness.command';
import { runPromptCommand } from '../commands/prompt.command';
import { runPythonCommand } from '../commands/python.command';
import { runQualityCommand } from '../commands/quality.command';
import { runReleaseCommand } from '../commands/release.command';
import { runReviewCommand } from '../commands/review.command';
import { runRewriteCommand } from '../commands/rewrite.command';
import { runScanCommand } from '../commands/scan.command';
import { runSpringbootCommand } from '../commands/springboot.command';
import { runSqlCommand } from '../commands/sql.command';
import { runSummarizeCommand } from '../commands/summarize.command';
import { runTaskCommand } from '../commands/task.command';
import { runTestCommand } from '../commands/test.command';
import { runIntakeCommand } from '../commands/intake.command';
import { runContextCommand } from '../commands/context.command';
import { runAttachmentsCommand } from '../commands/attachments.command';
import { runPolicyInitCommand } from '../commands/policy-init.command';
import { runPolicyIntakeCommand } from '../commands/policy-intake.command';
import { runPolicyScanCommand } from '../commands/policy-scan.command';
import { runPolicyReviewCommand } from '../commands/policy-review.command';
import { runSkillInitCommand } from '../commands/skill-init.command';
import { runSkillScanCommand } from '../commands/skill-scan.command';
import { runSkillRunCommand } from '../commands/skill-run.command';
import { runSkillReviewCommand } from '../commands/skill-review.command';
import { runDatacontractCommand } from '../commands/datacontract.command';
import { runSttmCommand } from '../commands/sttm.command';
import { runDqCommand } from '../commands/dq.command';
import { runReconcileCommand } from '../commands/reconcile.command';
import { runLineageCommand } from '../commands/lineage.command';
import { runSqlTranslateCommand } from '../commands/sql-translate.command';
import { runMigrationCommand } from '../commands/migration.command';
import { runSchedulerCommand } from '../commands/scheduler.command';
import { runPrivacyCommand } from '../commands/privacy.command';
import { runDataTestCommand } from '../commands/data-test.command';
import { runDataReviewCommand } from '../commands/data-review.command';
import { runCatalogCommand } from '../commands/catalog.command';
import { runSemanticCommand } from '../commands/semantic.command';
import { runCostCommand } from '../commands/cost.command';
import { runRunbookCommand } from '../commands/runbook.command';
import { runSqlReviewCommand } from '../commands/sql-review.command';
import { runNl2sqlCommand } from '../commands/nl2sql.command';
import { runResourcesScanCommand } from '../commands/resources-scan.command';
import { runResourcesInitCommand } from '../commands/resources-init.command';
import { runAgentsInitCommand } from '../commands/agents-init.command';
import { runAgentsScanCommand } from '../commands/agents-scan.command';
import { renderToolCommandTable, renderWorkflowTable } from '../workflow/workflow';

export async function routeCommand(args: CommandArgs): Promise<void> {
  switch (args.command) {
    case 'init': await runInitCommand(args); return;
    case 'scan': await runScanCommand(args); return;
    case 'context': await runContextCommand(args); return;
    case 'attachments': await runAttachmentsCommand(args); return;
    case 'policy-init': await runPolicyInitCommand(args); return;
    case 'policy-intake': await runPolicyIntakeCommand(args); return;
    case 'policy-scan': await runPolicyScanCommand(args); return;
    case 'policy-review': await runPolicyReviewCommand(args); return;
    case 'skill-init': await runSkillInitCommand(args); return;
    case 'skill-scan': await runSkillScanCommand(args); return;
    case 'skill-run': await runSkillRunCommand(args); return;
    case 'skill-review': await runSkillReviewCommand(args); return;
    case 'resources-init': await runResourcesInitCommand(args); return;
    case 'resources-scan': await runResourcesScanCommand(args); return;
    case 'agents-init': await runAgentsInitCommand(args); return;
    case 'agents-scan': await runAgentsScanCommand(args); return;
    case 'intake': await runIntakeCommand(args); return;
    case 'plan': await runPlanCommand(args); return;
    case 'loop': await runLoopCommand(args); return;
    case 'loop-next': await runLoopNextCommand(args); return;
    case 'loop-status': await runLoopStatusCommand(args); return;
    case 'loop-stop': await runLoopStopCommand(args); return;
    case 'prompt': await runPromptCommand(args); return;
    case 'summarize': await runSummarizeCommand(args); return;
    case 'compress': await runCompressCommand(args); return;
    case 'doc-review': await runDocReviewCommand(args); return;
    case 'rewrite': await runRewriteCommand(args); return;
    case 'checklist': await runChecklistCommand(args); return;
    case 'brainstorm': await runBrainstormCommand(args); return;
    case 'feature': await runFeatureCommand(args); return;
    case 'prd': await runPrdCommand(args); return;
    case 'story-split': await runStorySplitCommand(args); return;
    case 'prd-json': await runPrdJsonCommand(args); return;
    case 'ralph-readiness': await runRalphReadinessCommand(args); return;
    case 'journey': await runJourneyCommand(args); return;
    case 'design-md': await runDesignMdCommand(args); return;
    case 'ui-design': await runDesignMdCommand(args); return;
    case 'architecture-diagram': await runArchitectureDiagramCommand(args); return;
    case 'journey-diagram': await runJourneyDiagramCommand(args); return;
    case 'diagram': await runDiagramCommand(args); return;
    case 'frontend': await runFrontendCommand(args); return;
    case 'backend': await runBackendCommand(args); return;
    case 'springboot': await runSpringbootCommand(args); return;
    case 'python': await runPythonCommand(args); return;
    case 'data': await runDataCommand(args); return;
    case 'sql': await runSqlCommand(args); return;
    case 'dbschema': await runDbschemaCommand(args); return;
    case 'pipeline': await runPipelineCommand(args); return;
    case 'runbook': await runRunbookCommand(args); return;
    case 'cost': await runCostCommand(args); return;
    case 'semantic': await runSemanticCommand(args); return;
    case 'catalog': await runCatalogCommand(args); return;
    case 'data-review': await runDataReviewCommand(args); return;
    case 'data-test': await runDataTestCommand(args); return;
    case 'privacy': await runPrivacyCommand(args); return;
    case 'scheduler': await runSchedulerCommand(args); return;
    case 'migration': await runMigrationCommand(args); return;
    case 'sql-translate': await runSqlTranslateCommand(args); return;
    case 'nl2sql': await runNl2sqlCommand(args); return;
    case 'sql-review': await runSqlReviewCommand(args); return;
    case 'lineage': await runLineageCommand(args); return;
    case 'reconcile': await runReconcileCommand(args); return;
    case 'dq': await runDqCommand(args); return;
    case 'sttm': await runSttmCommand(args); return;
    case 'datacontract': await runDatacontractCommand(args); return;
    case 'quality': await runQualityCommand(args); return;
    case 'task': await runTaskCommand(args); return;
    case 'api': await runApiCommand(args); return;
    case 'review': await runReviewCommand(args); return;
    case 'test': await runTestCommand(args); return;
    case 'diff': await runDiffCommand(args); return;
    case 'release': await runReleaseCommand(args); return;
    case 'help':
    default:
      args.stream.markdown(helpMarkdown());
  }
}

export function normalizeCommand(command: string | undefined): ProductDevCommand {
  const value = (command ?? 'help').trim().toLowerCase();
  const supported: ProductDevCommand[] = [
    'help', 'init', 'policy-init', 'policy-intake', 'policy-scan', 'policy-review', 'skill-init', 'skill-scan', 'skill-run', 'skill-review', 'resources-init', 'resources-scan', 'agents-init', 'agents-scan', 'scan', 'intake', 'context', 'attachments', 'datacontract', 'sttm', 'dq', 'reconcile', 'lineage', 'sql-translate', 'nl2sql', 'sql-review', 'migration', 'scheduler', 'privacy', 'data-test', 'data-review', 'catalog', 'semantic', 'cost', 'runbook', 'plan', 'loop', 'loop-next', 'loop-status', 'loop-stop',
    'prompt', 'summarize', 'compress', 'doc-review', 'rewrite', 'checklist',
    'brainstorm', 'feature', 'prd', 'story-split', 'prd-json', 'ralph-readiness', 'journey', 'design-md', 'ui-design', 'architecture-diagram', 'journey-diagram', 'diagram', 'frontend', 'backend', 'springboot', 'python',
    'data', 'sql', 'dbschema', 'pipeline', 'quality', 'task', 'api', 'review', 'test', 'diff', 'release'
  ];
  return supported.includes(value as ProductDevCommand) ? (value as ProductDevCommand) : 'help';
}

export function helpMarkdown(): string {
  return `# @product-dev

Company full product development workflow assistant.

## Recommended Order

${renderWorkflowTable()}

## Local Policy Pack Commands

- /policy-init - create .product-dev/policy-packs with rule templates.
- /policy-intake - ask which local rules must be supplied.
- /policy-scan - inventory loaded policy files and missing recommended rules.
- /policy-review - review conflicts, precedence, gaps, and applicability.

## Context Commands

- /attachments - show active editor context and Chat attachments/references that will be injected into optimized prompts.

## VS Code Copilot Subagents

- /agents-init - create .github/agents custom agents and subagent orchestration resources.
- /agents-scan - scan custom agents and check native subagent readiness.

Use the generated \`product-dev-coordinator\` custom agent in Copilot Chat for complex tasks. It can use VS Code's \`agent\` tool to delegate to focused worker agents when subagents are available.

## Portable Prompt / Skill Resources

- /resources-init - create tool-neutral prompt/skill assets under agent-resources/ plus project overrides under .product-dev/prompts/.
- /resources-scan - inventory Copilot/OpenCode portable resources and migration readiness.

## Custom Skill Commands

- /skill-init - create .product-dev/skills with example local skills.
- /skill-scan - list loaded user-defined skills and matching metadata.
- /skill-run <skill-name> <task> - run a custom skill directly.
- /skill-review - review local skills for quality, metadata, and governance readiness.

All normal commands automatically optimize user input and inject matching skills before calling the model.

## Utility Tool Commands

These can be used at any stage without breaking the main delivery order.

${renderToolCommandTable()}

### Utility Examples

\`@product-dev /prompt 优化这个 prompt：阅读 React 代码生成 PRD，并给出 Journey 和卡点\`

\`@product-dev /summarize 总结当前文档，输出给老板看的 1 页版\`

\`@product-dev /compress 将当前需求、代码背景和限制压缩成 Claude Code / Codex 可执行上下文\`

\`@product-dev /doc-review review 这份 PRD，按 Blocker/High/Medium/Low 给问题\`

\`@product-dev /rewrite 将这段内容升级为银行管理层汇报风格\`

\`@product-dev /checklist 为 Spring Boot + PostgreSQL 功能上线生成检查清单\`

## Diagram Commands

- /architecture-diagram - generate architecture diagrams: system context, container/component, deployment, sequence, data-flow, security/trust-boundary.
- /journey-diagram - generate user journey diagrams: journey map, user flow, state transition, funnel/friction, instrumentation.
- /diagram - generate the diagram pack required by the current project step.

## SQL Tool Commands

- /nl2sql - convert natural language business questions into dialect-aware SQL.
- /sql-translate - translate SQL between PostgreSQL, Oracle, BigQuery, MaxCompute/ODPS, MySQL, SQL Server, Snowflake, Databricks/Spark SQL, and Hive.
- /sql-review - review SQL for correctness, join/grain risk, DQ, reconciliation, privacy, and performance.

## Ralph Loop Commands

- \`/loop <task>\` — create a local Ralph-style loop state and execute the first iteration.
- \`/loop-next\` — continue the next pending command in the loop.
- \`/loop-status\` — inspect progress, next command, and completion criteria.
- \`/loop-stop\` — stop the current loop.


## Interactive Initialization

- \`/init\` — 生成前端、后端、数据开发分轨项目骨架、问题清单、项目画像模板。
- \`/init frontend\` — 只初始化前端轨道。
- \`/init backend\` — 只初始化后端轨道。
- \`/init data\` — 只初始化银行数据开发轨道。
- \`/init fullstack\` — 初始化前端 + 后端 + 数据开发完整结构。
- \`/intake\` — 展示需要补充的背景问题。
- \`/context\` — 保存用户回答，作为后续命令的项目背景。

## Bank Data Engineering Pack

- \`/datacontract\` — 数据契约、字段定义、SLA、敏感等级、Breaking Change 规则。
- \`/sttm\` — Source-to-Target Mapping、转换规则、Join 规则、默认值、异常值处理。
- \`/dq\` — 可执行数据质量规则：完整性、唯一性、合法性、一致性、及时性、对账。
- \`/reconcile\` — 源目标对账、金额/笔数/主键校验、差异报告、异常落表。
- \`/lineage\` — 表级/字段级血缘、敏感字段传播、Mermaid 血缘图。
- \`/sql-translate\` — Oracle/PostgreSQL/BigQuery/MaxCompute/Hive SQL 方言迁移。
- \`/migration\` — DDL/历史数据/增量同步/双跑/回滚迁移方案。
- \`/scheduler\` — Airflow/DolphinScheduler/Control-M/DataWorks 调度设计。
- \`/privacy\` — PII/SPI 识别、脱敏、权限、保留期、访问审计。
- \`/data-test\` — 数据单测、Schema 测试、快照测试、回归测试。
- \`/data-review\` — 数据开发专项 Review：粒度、Join、性能、DQ、对账、血缘、上线风险。
- \`/catalog\` — 数据目录、业务术语、Owner、质量等级、下游消费者。
- \`/semantic\` — 语义层、指标口径、Agent-readable Data Card。
- \`/cost\` — BigQuery/MaxCompute/Snowflake/Databricks 成本优化。
- \`/runbook\` — 数据任务生产运维、补数、重跑、incident、SLA 恢复。

## Product Design

- \`/brainstorm\` — 头脑风暴：机会点、功能创意、MVP、实验计划、RICE 排序。
- \`/feature\` — 功能设计：把想法沉淀为 Feature Design。
- \`/prd\` — PRD：从需求、代码、路由/API 推断生成产品需求文档。
- \`/journey\` — 用户旅程：从前端路由和组件推断用户路径与卡点。
- \`/design-md\` — 读取现有前端项目或用户设计意图，生成 Stitch-compatible \`DESIGN.md\`。
- \`/ui-design\` — 基于 \`DESIGN.md\` 进行 UI 设计、页面视觉规范和组件设计建议。

## Frontend / Backend / Data

- \`/frontend\` — React/TypeScript、组件、状态、API hooks、测试、无障碍、性能。
- \`/backend\` — 服务边界、领域模型、API、事务、权限、日志、观测性。
- \`/springboot\` — Java Spring Boot 分层实现计划。
- \`/python\` — Python FastAPI/Flask 服务实现计划。
- \`/data\` — 数据模型、STTM、转换、DQ、血缘、审计、服务层。
- \`/sql\` — PostgreSQL、MaxCompute、BigQuery、Oracle 等 SQL 设计/优化。
- \`/dbschema\` — Schema、索引、分区、迁移、回滚。
- \`/pipeline\` — 调度、重试、幂等、回补、SLA、监控。

## Governance & Delivery

- \`/quality\` — 质量门禁。
- \`/task\` — 任务拆解。
- \`/api\` — API Contract。
- \`/review\` — 企业级 Code Review。
- \`/test\` — 测试计划。
- \`/diff\` — 代码变更影响分析。
- \`/release\` — 发布准备。
`;
}
