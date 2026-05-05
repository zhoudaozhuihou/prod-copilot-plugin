# BigQuery SQL Generation Prompt Template

Use this prompt to generate or review Google BigQuery Standard SQL schemas, queries, and ETL logic.

## BigQuery Architectural Requirements
1. **Cost Control (Partitions)**: All large fact or event tables MUST be partitioned. Typically use time-unit column partitioning (e.g., `PARTITION BY DATE(created_at)`). Consider enabling `require_partition_filter = true`.
2. **Performance (Clustering)**: Identify highly filtered or aggregated columns and define them in the `CLUSTER BY` clause (up to 4 columns).
3. **Data Modeling (Nested/Repeated Fields)**: BigQuery is a columnar store. Heavily utilize `ARRAY` and `STRUCT` to pre-join 1-to-N relationships and improve scan efficiency. Avoid traditional snowflake schemas if possible.
4. **Update Strategy**: Avoid row-by-row `UPDATE`/`DELETE`. Use `MERGE` statements for Upsert (SCD Type 1/2) operations.
5. **Security**: Assign Google Cloud Policy Tags to PII columns directly within the DDL (e.g., `OPTIONS(description="...", policy_tags=["..."])`).

## Expected Output
- **DDL Script**: Complete `CREATE TABLE` statements including Partition, Cluster, and Column descriptions.
- **DML / ETL Script**: BigQuery Standard SQL for data transformation (e.g., `MERGE` statements).
- **Cost Estimation Note**: A brief explanation of how the query minimizes slot consumption and bytes scanned.
