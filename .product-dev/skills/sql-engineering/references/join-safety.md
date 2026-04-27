# Join Safety Reference

1. Declare the driving table and output grain.
2. For every join, state cardinality: 1:1, 1:N, N:1, or N:M.
3. Do not aggregate money/count metrics after a one-to-many join without deduplication strategy.
4. SCD2 joins require effective_start/effective_end conditions.
5. Soft-delete/status fields require filters.
6. Partitioned tables require date/partition predicates.
7. Produce validation SQL: row count before/after join, duplicate key check, null join key check, and amount/count reconciliation.
