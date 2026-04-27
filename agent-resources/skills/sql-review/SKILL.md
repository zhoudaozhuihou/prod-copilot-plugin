---
name: sql-review
description: Review SQL for production readiness, correctness, business semantics, join safety, performance, cost, data quality, reconciliation, lineage, privacy, and dialect-specific risks. Use this skill whenever the user asks to review, check, optimize, approve, migrate, or troubleshoot SQL for PostgreSQL, Oracle, BigQuery, MaxCompute/ODPS, MySQL, SQL Server, Snowflake, Databricks/Spark SQL, or Hive.
appliesTo: sql-review,sql,data-review,review
triggers: sql review,review sql,检查sql,sql评审,性能优化,join,partition,cost
---

# SQL Review

## Use this skill when

The user provides SQL or asks whether SQL is safe, correct, performant, or production-ready.

## Review workflow

1. Identify dialect, intent, grain, driving table, and output consumers.
2. Check correctness: filters, joins, nulls, date windows, SCD2, soft deletes, duplicate amplification, and aggregation grain.
3. Check performance/cost: partition pruning, clustering/index usage, scan size, shuffle/sort pressure, and unnecessary CTE/materialization.
4. Check data controls: DQ, reconciliation, lineage, privacy, masking, and audit evidence.
5. Return severity-based findings with evidence, impact, fix, and validation SQL.

## Reference

Read `references/review-rubric.md` for the full checklist.

## Output pattern

Use Blocker / High / Medium / Low. Every finding must include evidence, impact, fix, and validation SQL or verification step.
