# Schema Grounding for NL2SQL

Ask for or infer explicitly:

- Table names and business meanings
- Column names, types, and sensitive classifications
- Primary/unique keys
- Partition columns
- Date/time fields
- Metric definitions
- Join relationships
- SCD2 validity fields
- Soft-delete/status fields

If missing, produce a draft SQL skeleton with placeholders and a list of required metadata questions.
