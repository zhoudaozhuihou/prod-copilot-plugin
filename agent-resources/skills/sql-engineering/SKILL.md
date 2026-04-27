---
name: sql-engineering
description: Use this skill for production SQL generation, optimization, review, dialect-specific design, query safety, DQ validation, reconciliation SQL, lineage extraction, and SQL migration across PostgreSQL, Oracle, BigQuery, MaxCompute/ODPS, MySQL, SQL Server, Snowflake, Databricks/Spark SQL, and Hive. Trigger whenever the user asks for SQL, query optimization, SQL review, join rules, dialect conversion, natural language to SQL, partition pruning, cost optimization, or production data validation.
appliesTo: sql,nl2sql,sql-translate,sql-review,dq,reconcile,lineage,data-review,cost
triggers: sql,nl2sql,postgresql,oracle,bigquery,maxcompute,odps,hive,snowflake,databricks,review,translate,转换,优化
---

# SQL Engineering

## Karpathy Execution Guardrails

Apply the shared `karpathy-guidelines` skill for non-trivial work:

- State assumptions before designing or changing anything.
- Prefer the smallest useful artifact over speculative completeness.
- Keep changes surgical and trace every recommendation to the user request or evidence.
- Convert the task into verifiable success criteria before calling it done.
- If project policy, user intent, or repository evidence is unclear, ask targeted questions instead of guessing.

## Use this skill when

The task needs SQL that is correct, performant, auditable, and safe to run in enterprise data environments.

## Workflow

1. Identify dialect, business grain, driving table, date window, and expected output.
2. Verify schema grounding. If metadata is missing, ask for it or label the SQL as a draft skeleton.
3. Check join cardinality before aggregation. Explain one-to-one, one-to-many, or many-to-many risk.
4. Add partition pruning and cost controls for BigQuery, MaxCompute, Snowflake, Databricks, and Hive-like engines.
5. Add validation SQL, DQ SQL, and reconciliation SQL where the output could affect reporting, risk, finance, or customer data.

## References

- Read `references/dialect-matrix.md` when translating or using dialect-specific functions.
- Read `references/join-safety.md` when joins, SCD2, soft deletes, or aggregation are involved.

## Output pattern

Always include dialect, assumptions, generated/revised SQL, explanation, validation SQL, performance notes, DQ/reconciliation checks, privacy risks, and next command.
