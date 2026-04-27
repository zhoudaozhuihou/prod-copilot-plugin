# Command Reference

所有命令都通过 Copilot Chat 的 `@product-dev` 调用。

## Setup / Workflow

### `@product-dev /init`

Initialize .product-dev configuration and docs folders.

**使用示例**

```text
@product-dev /init <补充你的任务背景或上下文>
```

### `@product-dev /scan`

Scan current repository and generate a repo map.

**使用示例**

```text
@product-dev /scan <补充你的任务背景或上下文>
```

### `@product-dev /intake`

Run interactive project intake and generate missing-context questions.

**使用示例**

```text
@product-dev /intake <补充你的任务背景或上下文>
```

### `@product-dev /context`

Capture user answers and update project background context.

**使用示例**

```text
@product-dev /context <补充你的任务背景或上下文>
```

### `@product-dev /plan`

Create an ordered delivery plan and recommended command sequence for the current task.

**使用示例**

```text
@product-dev /plan <补充你的任务背景或上下文>
```

## Policy Pack

### `@product-dev /policy-init`

Create local policy pack folders and rule templates for company, department, country, project, and environment overlays.

**使用示例**

```text
@product-dev /policy-init <补充你的任务背景或上下文>
```

### `@product-dev /policy-intake`

Ask interactive questions to identify which company/department/country/project rules must be supplied.

**使用示例**

```text
@product-dev /policy-intake <补充你的任务背景或上下文>
```

### `@product-dev /policy-scan`

Scan .product-dev/policy-packs and policies folders, inventory loaded rules, and detect missing policy files.

**使用示例**

```text
@product-dev /policy-scan <补充你的任务背景或上下文>
```

### `@product-dev /policy-review`

Review policy pack completeness, conflicts, precedence, and applicability to the current workflow.

**使用示例**

```text
@product-dev /policy-review <补充你的任务背景或上下文>
```

## Ralph Loop

### `@product-dev /loop`

Start a Ralph-style loop using external state and execute iterative workflow steps.

**使用示例**

```text
@product-dev /loop <补充你的任务背景或上下文>
```

### `@product-dev /loop-next`

Continue the next pending Ralph loop iteration from .product-dev/ralph-loop.local.json.

**使用示例**

```text
@product-dev /loop-next <补充你的任务背景或上下文>
```

### `@product-dev /loop-status`

Show current Ralph loop state, progress, next command, and outstanding tasks.

**使用示例**

```text
@product-dev /loop-status <补充你的任务背景或上下文>
```

### `@product-dev /loop-stop`

Stop the active Ralph loop and mark it as paused/stopped.

**使用示例**

```text
@product-dev /loop-stop <补充你的任务背景或上下文>
```

## Utility Tools

### `@product-dev /prompt`

Optimize rough prompts into enterprise-grade prompts with role, context, constraints, output schema, and evaluation criteria.

**使用示例**

```text
@product-dev /prompt <补充你的任务背景或上下文>
```

### `@product-dev /summarize`

Summarize selected text, documents, or repository context into decision-ready notes.

**使用示例**

```text
@product-dev /summarize <补充你的任务背景或上下文>
```

### `@product-dev /compress`

Compress long context into a compact briefing for Copilot, Claude Code, Codex, or Ralph loop execution.

**使用示例**

```text
@product-dev /compress <补充你的任务背景或上下文>
```

### `@product-dev /doc-review`

Review prompts, documents, PRDs, designs, SQL, or release notes with severity and actionable fixes.

**使用示例**

```text
@product-dev /doc-review <补充你的任务背景或上下文>
```

### `@product-dev /rewrite`

Rewrite or upgrade content for executive, product, technical, banking-grade, or implementation-ready use.

**使用示例**

```text
@product-dev /rewrite <补充你的任务背景或上下文>
```

### `@product-dev /checklist`

Generate execution checklists, DoD, review checklists, handoff checklists, and acceptance checklists.

**使用示例**

```text
@product-dev /checklist <补充你的任务背景或上下文>
```

## Product Design

### `@product-dev /brainstorm`

Brainstorm product opportunities, feature ideas, experiments, and MVP options.

**使用示例**

```text
@product-dev /brainstorm <补充你的任务背景或上下文>
```

### `@product-dev /feature`

Convert brainstorm ideas into structured feature design.

**使用示例**

```text
@product-dev /feature <补充你的任务背景或上下文>
```

### `@product-dev /prd`

Generate or update PRD from user input and repository context.

**使用示例**

```text
@product-dev /prd <补充你的任务背景或上下文>
```

### `@product-dev /journey`

Generate user journey and identify friction points from frontend code.

**使用示例**

```text
@product-dev /journey <补充你的任务背景或上下文>
```

## Frontend / Backend

### `@product-dev /frontend`

Design or implement frontend pages, components, state management, validation, tests, and accessibility.

**使用示例**

```text
@product-dev /frontend <补充你的任务背景或上下文>
```

### `@product-dev /backend`

Design backend services, APIs, domain model, security, observability, and tests.

**使用示例**

```text
@product-dev /backend <补充你的任务背景或上下文>
```

### `@product-dev /springboot`

Generate or review Java Spring Boot service design, controllers, DTOs, services, repositories, tests, and configuration.

**使用示例**

```text
@product-dev /springboot <补充你的任务背景或上下文>
```

### `@product-dev /python`

Generate or review Python backend design, FastAPI/Flask services, data services, tests, and packaging.

**使用示例**

```text
@product-dev /python <补充你的任务背景或上下文>
```

### `@product-dev /api`

Generate or validate API contract.

**使用示例**

```text
@product-dev /api <补充你的任务背景或上下文>
```

## Data Engineering

### `@product-dev /data`

Design data development solution: data model, ingestion, transformation, quality, lineage, governance, and serving.

**使用示例**

```text
@product-dev /data <补充你的任务背景或上下文>
```

### `@product-dev /sql`

Generate or optimize SQL for PostgreSQL, MaxCompute, BigQuery, Oracle, and other engines.

**使用示例**

```text
@product-dev /sql <补充你的任务背景或上下文>
```

### `@product-dev /dbschema`

Design or review database schema, indexes, partitions, constraints, and migration scripts.

**使用示例**

```text
@product-dev /dbschema <补充你的任务背景或上下文>
```

### `@product-dev /pipeline`

Design data pipelines, orchestration, retry, idempotency, SLA, monitoring, and backfill strategy.

**使用示例**

```text
@product-dev /pipeline <补充你的任务背景或上下文>
```

### `@product-dev /datacontract`

Generate bank-grade data contract and compatibility rules.

**使用示例**

```text
@product-dev /datacontract <补充你的任务背景或上下文>
```

### `@product-dev /sttm`

Generate Source-to-Target Mapping and transformation rules.

**使用示例**

```text
@product-dev /sttm <补充你的任务背景或上下文>
```

### `@product-dev /dq`

Generate executable data quality rules and SQL checks.

**使用示例**

```text
@product-dev /dq <补充你的任务背景或上下文>
```

### `@product-dev /reconcile`

Generate reconciliation design, SQL checks, and exception handling.

**使用示例**

```text
@product-dev /reconcile <补充你的任务背景或上下文>
```

### `@product-dev /lineage`

Generate table/field lineage analysis and Mermaid lineage graph.

**使用示例**

```text
@product-dev /lineage <补充你的任务背景或上下文>
```

### `@product-dev /sql-translate`

Translate SQL across Oracle, PostgreSQL, BigQuery, MaxCompute, Hive, etc.

**使用示例**

```text
@product-dev /sql-translate <补充你的任务背景或上下文>
```

### `@product-dev /migration`

Design data/schema migration, dual-run, validation, and rollback.

**使用示例**

```text
@product-dev /migration <补充你的任务背景或上下文>
```

### `@product-dev /scheduler`

Design DAG scheduling, dependency, retry, SLA, and alerting strategy.

**使用示例**

```text
@product-dev /scheduler <补充你的任务背景或上下文>
```

### `@product-dev /privacy`

Generate data privacy, masking, retention, and access-control assessment.

**使用示例**

```text
@product-dev /privacy <补充你的任务背景或上下文>
```

### `@product-dev /data-test`

Generate data testing strategy and executable test cases.

**使用示例**

```text
@product-dev /data-test <补充你的任务背景或上下文>
```

### `@product-dev /data-review`

Run bank-grade data engineering review for SQL/model/pipeline/release.

**使用示例**

```text
@product-dev /data-review <补充你的任务背景或上下文>
```

### `@product-dev /catalog`

Generate data catalog entry and business glossary.

**使用示例**

```text
@product-dev /catalog <补充你的任务背景或上下文>
```

### `@product-dev /semantic`

Generate semantic layer and agent-readable data card.

**使用示例**

```text
@product-dev /semantic <补充你的任务背景或上下文>
```

### `@product-dev /cost`

Generate database/cloud cost optimization plan.

**使用示例**

```text
@product-dev /cost <补充你的任务背景或上下文>
```

### `@product-dev /runbook`

Generate production runbook, incident playbook, and backfill playbook.

**使用示例**

```text
@product-dev /runbook <补充你的任务背景或上下文>
```

## Governance / Delivery

### `@product-dev /quality`

Generate quality gates for code, API, data, testing, security, and release readiness.

**使用示例**

```text
@product-dev /quality <补充你的任务背景或上下文>
```

### `@product-dev /task`

Split PRD or feature design into implementation tasks.

**使用示例**

```text
@product-dev /task <补充你的任务背景或上下文>
```

### `@product-dev /review`

Run enterprise code review against current git diff.

**使用示例**

```text
@product-dev /review <补充你的任务背景或上下文>
```

### `@product-dev /test`

Generate test plan and test cases from PRD, code, and diff.

**使用示例**

```text
@product-dev /test <补充你的任务背景或上下文>
```

### `@product-dev /diff`

Compare git diff with PRD, journey, API contract, and test plan.

**使用示例**

```text
@product-dev /diff <补充你的任务背景或上下文>
```

### `@product-dev /release`

Generate release notes, go-live checklist, rollback plan, and risk assessment.

**使用示例**

```text
@product-dev /release <补充你的任务背景或上下文>
```

## 使用建议

- 不确定顺序时先执行 `@product-dev /plan`。
- 涉及公司/部门/国家规则时先执行 `@product-dev /policy-scan`。
- 数据开发正式输出前建议先完成 `/datacontract`、`/sttm`、`/dq`、`/reconcile`、`/lineage`。
- 发布前建议执行 `/quality`、`/review`、`/release`、`/runbook`。

---

# v0.9 Prompt Optimizer and Skill Commands

## Automatic prompt optimization

All major artifact commands now pass the user request through `UserInputOptimizer` before the final model prompt is built. This adds normalized goal, detected intent, task scope, constraints, required context, missing questions, expected output, quality checks, and suggested skills.

## Skill commands

| Command | Purpose | Output |
|---|---|---|
| `/skill-init` | Create `.product-dev/skills/` and example skills | `.product-dev/skills/**` |
| `/skill-scan` | List custom skills and metadata | Chat table / `docs/skills` |
| `/skill-run <skill> <task>` | Run one custom skill directly | `docs/skills/<skill>-result.md` |
| `/skill-review` | Review local skills for quality and governance | `docs/skills/skill-review.md` |

## Skill file format

```md
---
name: my-skill
description: What this skill improves
appliesTo: frontend,review,test
triggers: react,ui,accessibility
---

# My Skill

Instruction pack goes here.
```

## Precedence

```text
Policy Pack > Custom Skill > Optimized User Input > Generic Prompt Defaults
```


## Anthropic-Style Skill Quality Update

Skills now use the portable directory pattern:

```text
<skill-name>/SKILL.md
<skill-name>/references/
<skill-name>/evals/
```

`SKILL.md` requires `name` and `description`. The description is used for triggering, while long details belong in `references/`. Use `/skill-scan` for inventory and `/skill-review` for quality review.

## Ralph PRD / Loop Commands v1.4

### `/story-split`

Split a PRD, feature design, or user request into Ralph-sized user stories. Each story should be small enough for one fresh agent iteration and include stable ID, priority, dependencies, acceptance criteria, and validation evidence.

### `/prd-json`

Convert PRD Markdown or story split output into Ralph-compatible `prd.json` content. The generated JSON must use `passes: false` for every story and include dependency-aware priority order. The command writes a Markdown conversion report under `docs/prd/ralph-prd-json.md`; copy the JSON block into `scripts/ralph/prd.json` before autonomous execution.

### `/ralph-readiness`

Review whether the project is ready for loop execution. It checks PRD quality, story size, dependency order, prd.json schema, quality commands, `progress.txt`, `AGENTS.md` / `CLAUDE.md`, and unresolved blockers.


## Diagram Workflow v1.7

New commands:

- `@product-dev /architecture-diagram` — generates system context, container/component, deployment, sequence, data-flow, security/trust-boundary, and observability diagrams.
- `@product-dev /journey-diagram` — generates user journey, user flow, state transition, funnel/friction, and instrumentation diagrams.
- `@product-dev /diagram` — generates the minimum useful diagram pack for the current SDLC step.

All major product, frontend, backend, API, data, quality, release, and runbook artifacts now include a `Required Diagrams` section when visual documentation is useful. Mermaid is the default format so diagrams are portable to GitHub, VS Code, OpenCode, and documentation sites.
