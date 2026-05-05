---
name: sql-translate
description: Translate SQL from legacy databases (Oracle, Teradata, PostgreSQL, SQL Server) to cloud-native Data Warehouses (BigQuery, MaxCompute/ODPS). Preserves business semantics while applying target-specific performance optimizations (Partitions, Clustering, Arrays/Structs).
appliesTo: sql-translate,sql,migration,data-review,dbschema
triggers: sql translate,方言转换,oracle,teradata,bigquery,maxcompute,postgresql,hive,migration,云原生迁移
---

# SQL Translate & Modernization

## Karpathy Execution Guardrails

Apply the shared `karpathy-guidelines` skill for non-trivial work:

- State assumptions before designing or changing anything.
- Prefer the smallest useful artifact over speculative completeness.
- Keep changes surgical and trace every recommendation to the user request or evidence.
- Convert the task into verifiable success criteria before calling it done.
- If project policy, user intent, or repository evidence is unclear, ask targeted questions instead of guessing.

## Workflow

1. **Dialect Identification**: Identify source (e.g. Teradata, Oracle) and target dialect (e.g. BigQuery, MaxCompute). If either is missing, ask before producing final SQL.
2. **Semantic Preservation**: Understand the business intent (e.g. cumulative sums, deduplication) before syntax conversion.
3. **Cloud-Native Modernization Mapping**:
   - **Teradata to BigQuery/MaxCompute**: Translate `QUALIFY`, `SAMPLE`, and implicit Date Math. Map Primary Indexes (PI) to BQ Clustering or MaxCompute Partitions.
   - **Oracle to BigQuery/MaxCompute**: Remove `DUAL`, translate `ROWNUM` to `ROW_NUMBER()`, convert `CONNECT BY` to Recursive CTEs, and replace `NVL`/`DECODE` with standard `COALESCE`/`CASE`.
   - **PostgreSQL to BigQuery/MaxCompute**: Translate `DISTINCT ON` to `QUALIFY` or Window Functions. Map JSONB operators to target JSON functions.
4. **Performance Tuning**: Add explicit `PARTITION BY` and `CLUSTER BY` in DDL. Translate row-by-row updates into `MERGE` or `INSERT OVERWRITE` statements.
5. **Output Generation**: Provide the translated SQL, DDL changes, compatibility warnings (e.g., precision loss in floats), and validation queries to verify source vs target data.

## Reference

Read `policies/sql-dialect-matrix.yaml` for mapping guidance.
