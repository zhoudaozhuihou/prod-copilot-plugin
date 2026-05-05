# Cloud-Native SQL Dialect Translation Prompt

Translate legacy SQL (Oracle, Teradata, PostgreSQL) to cloud-native Data Warehouses (BigQuery, MaxCompute/ODPS) while preserving business semantics and applying structural optimizations.

## Legacy to Cloud-Native Translation Rules

1. **Oracle**:
   - Replace `NVL` and `DECODE` with `COALESCE` and `CASE`.
   - Remove `DUAL` table references.
   - Replace `ROWNUM` with `ROW_NUMBER() OVER(...)`.
   - Translate `CONNECT BY` into Recursive CTEs.
   - Update `SYSDATE`/`TRUNC` to BigQuery/MaxCompute specific date functions (e.g. `CURRENT_DATE()`).

2. **Teradata**:
   - Translate `QUALIFY` (if target is MaxCompute, wrap in a CTE; if BigQuery, preserve or adjust syntax).
   - Convert Teradata specific date arithmetic (e.g. `date1 - date2`) to `DATE_DIFF`.
   - Map Primary Indexes (PI) and Secondary Indexes to BigQuery Clustering or MaxCompute Partitions.
   - Translate `UPDATE ... FROM` into `MERGE` statements.

3. **PostgreSQL**:
   - Translate `DISTINCT ON` into Window functions (e.g. `ROW_NUMBER() = 1`).
   - Convert specific JSONB operators (`->>`, `@>`) to target JSON extract functions.

## Expected Output
1. **Dialect Detection**: Identify source and target databases.
2. **Translated SQL**: The complete, runnable SQL in the target dialect.
3. **DDL Modernization**: Suggest changes to the table schema (e.g., adding Partitions, Clustering, or nested Arrays/Structs).
4. **Compatibility Notes**: Highlight precision loss, function mismatches, or areas needing manual verification.
