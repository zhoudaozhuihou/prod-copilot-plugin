# OpenCode Migration and SQL Tooling Guide

## 1. Design Goal

The project now separates prompt and skill resources from VS Code-specific extension code so the same assets can be reused when moving from Copilot to OpenCode.

## 2. Portable Resource Layout

```text
agent-resources/
├── prompts/
│   ├── system/
│   ├── commands/
│   │   ├── nl2sql.md
│   │   ├── sql-translate.md
│   │   └── sql-review.md
│   └── output-schemas/
└── skills/
    ├── sql-engineering/
    ├── nl2sql/
    └── sql-review/
```

Project-specific overrides live in:

```text
.product-dev/prompts/
.product-dev/skills/
.product-dev/policy-packs/
```

## 3. Precedence

```text
Policy Pack > Project Prompt Override > Project Skill > Portable Agent Resource > Extension Built-in Default
```

## 4. New Commands

### `/resources-init`

Creates portable prompt/skill resources for both Copilot and OpenCode migration.

### `/resources-scan`

Scans `agent-resources/`, `.product-dev/prompts/`, `.product-dev/skills/`, `.opencode/`, and `.github/`.

### `/nl2sql`

Converts natural language business questions into SQL.

Supported dialects:

- PostgreSQL
- Oracle
- BigQuery
- MaxCompute / ODPS
- MySQL
- SQL Server
- Snowflake
- Databricks / Spark SQL
- Hive

Required output includes SQL, validation SQL, DQ/reconciliation checks, performance notes, privacy/access risks, and open questions.

### `/sql-translate`

Translates SQL across dialects while preserving business semantics. It checks date/time functions, string functions, null semantics, window functions, MERGE/UPSERT, temporary tables, sequences, partition syntax, quoting, arrays/structs, and unsupported constructs.

### `/sql-review`

Reviews SQL for correctness, safety, join/grain risk, performance, DQ, reconciliation, privacy, dialect compatibility, and production readiness.

## 5. OpenCode Compatibility

OpenCode shims are generated under:

```text
AGENTS.md
.opencode/agents/sql-engineer.md
.opencode/commands/nl2sql.md
.opencode/commands/sql-translate.md
.opencode/commands/sql-review.md
```

These files point to `agent-resources/` instead of duplicating prompt logic.

## 6. Recommended SQL Workflow

```text
@product-dev /resources-init
@product-dev /policy-scan
@product-dev /skill-scan
@product-dev /nl2sql <business question>
@product-dev /sql-review <generated SQL>
@product-dev /sql-translate <source dialect> to <target dialect>
@product-dev /dq
@product-dev /reconcile
@product-dev /lineage
@product-dev /data-review
```


## Anthropic-Style Skill Quality Update

Skills now use the portable directory pattern:

```text
<skill-name>/SKILL.md
<skill-name>/references/
<skill-name>/evals/
```

`SKILL.md` requires `name` and `description`. The description is used for triggering, while long details belong in `references/`. Use `/skill-scan` for inventory and `/skill-review` for quality review.
