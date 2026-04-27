---
name: sql-translate
description: Translate SQL between PostgreSQL, Oracle, BigQuery, MaxCompute/ODPS, MySQL, SQL Server, Snowflake, Databricks/Spark SQL, and Hive while preserving business semantics. Use this skill when the user asks for SQL dialect conversion, migration, modernization, engine replacement, syntax compatibility, date/function mapping, MERGE/UPSERT translation, partition syntax changes, or cloud data warehouse migration.
appliesTo: sql-translate,sql,migration,data-review
triggers: sql translate,方言转换,oracle,bigquery,maxcompute,postgresql,hive,snowflake,databricks,migration
---

# SQL Translate

## Workflow

1. Identify source and target dialect. If either is missing, ask before producing final SQL.
2. Preserve business semantics before syntax style.
3. Map data types, date/time functions, string functions, null semantics, CTEs, windows, MERGE/UPSERT, temp tables, sequences, partition filters, quoting, arrays/structs, and UDFs.
4. Mark non-equivalent functions and required manual decisions.
5. Provide translated SQL, compatibility notes, validation SQL, and performance/cost adjustments.

## Reference

Read `references/dialect-matrix.md` for mapping guidance.
