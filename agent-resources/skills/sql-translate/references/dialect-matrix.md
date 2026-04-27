# SQL Dialect Matrix

| Area | PostgreSQL | Oracle | BigQuery | MaxCompute/ODPS | Snowflake | Databricks/Spark SQL | Hive |
|---|---|---|---|---|---|---|---|
| Date diff | date - date / AGE | MONTHS_BETWEEN, TRUNC | DATE_DIFF | DATEDIFF | DATEDIFF | datediff | datediff |
| Current date | CURRENT_DATE | SYSDATE / CURRENT_DATE | CURRENT_DATE() | GETDATE() / CURRENT_DATE | CURRENT_DATE | current_date() | current_date |
| Null handling | COALESCE | NVL/COALESCE | IFNULL/COALESCE | NVL/COALESCE | COALESCE | coalesce | coalesce |
| Limit | LIMIT | FETCH FIRST / ROWNUM | LIMIT | LIMIT | LIMIT | LIMIT | LIMIT |
| Merge | INSERT ON CONFLICT / MERGE newer versions | MERGE | MERGE | MERGE INTO support varies by table type | MERGE | MERGE | limited |

Always verify exact engine/version behavior before production use.
