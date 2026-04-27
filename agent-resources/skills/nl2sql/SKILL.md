---
name: nl2sql
description: Convert natural language business questions into schema-grounded SQL with ambiguity handling, metric/grain definition, safe joins, validation queries, and dialect-specific syntax. Use this skill whenever the user asks in natural language for a query, report, metric, dashboard dataset, ad-hoc analysis, or SQL generation for PostgreSQL, Oracle, BigQuery, MaxCompute/ODPS, MySQL, SQL Server, Snowflake, Databricks/Spark SQL, or Hive.
appliesTo: nl2sql,sql,semantic,catalog
triggers: natural language to sql,nl2sql,自然语言,生成sql,查询,报表,指标
---

# NL2SQL

## Karpathy Execution Guardrails

Apply the shared `karpathy-guidelines` skill for non-trivial work:

- State assumptions before designing or changing anything.
- Prefer the smallest useful artifact over speculative completeness.
- Keep changes surgical and trace every recommendation to the user request or evidence.
- Convert the task into verifiable success criteria before calling it done.
- If project policy, user intent, or repository evidence is unclear, ask targeted questions instead of guessing.

## Use this skill when

The user describes a data question in business language and needs SQL.

## Workflow

1. Restate the business question and identify metric, dimension, filter, date range, and output grain.
2. Ground the SQL in known schema. If table/column names are unknown, ask targeted questions and optionally provide a labeled draft skeleton.
3. Select dialect and use dialect-specific date, string, null, array/struct, and partition syntax.
4. Explain joins, filters, aggregations, privacy implications, and assumptions.
5. Provide validation SQL and at least one DQ/reconciliation check.

## Reference

Read `references/schema-grounding.md` when schema is incomplete or ambiguous.

## Output pattern

Business question → dialect → assumptions → required schema → SQL → explanation → validation SQL → DQ/reconciliation → risks → next command.
