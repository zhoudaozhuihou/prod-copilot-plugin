---
name: alicloud-data-engineering
description: Use this skill for designing and deploying data engineering workloads on Alibaba Cloud (阿里云). Covers MaxCompute (ODPS) SQL dialect specifics, DataWorks scheduling and CI/CD, Hologres real-time serving, and Flink streaming.
appliesTo: data,sql,pipeline,dbschema,release,runbook
triggers: alicloud,aliyun,maxcompute,odps,dataworks,hologres,flink,阿里云,上线
---

# Alibaba Cloud Data Engineering Skill

## Execution Guardrails
- **MaxCompute (ODPS) Specifics**: Always enforce `LIFECYCLE` on table creations. Enforce partition pruning (`pt=`) on all large table queries. Do not use standard SQL features not supported by MaxCompute.
- **DataWorks Scheduling**: When designing pipelines, explicitly define DataWorks node types (e.g., ODPS SQL, PyODPS, Data Integration), dependency upstream/downstream configurations, and scheduling parameters (e.g., `${bizdate}`).
- **Data Security (PIPL & DSL)**: Alibaba Cloud deployments in China must strictly adhere to local Data Security Law (DSL) and Personal Information Protection Law (PIPL). Ensure DataWorks Data Security Guard (数据安全卫士) masking rules are specified for PII fields.
- **CI/CD & Release**: DataWorks standard release process requires moving from Dev to Prod. Explicitly list the deployment package, cross-project table grants, and resource file paths.

## Workflow
1. **Schema Design**: Generate MaxCompute DDL with explicit `PARTITIONED BY` and `LIFECYCLE`.
2. **SQL Development**: Write ODPS-compliant SQL. Use `MAPJOIN` hints for small tables.
3. **Pipeline Configuration**: Define DataWorks task nodes, parameters, and retry intervals.
4. **Security Review**: Flag fields requiring dynamic masking or encryption.
5. **Release Checklist**: Generate a deployment manifest for moving tasks from the DataWorks Development environment to the Production environment.

## Output Requirements
- MaxCompute DDL (with Lifecycle and Partitions)
- ODPS SQL Logic
- DataWorks Node Configuration
- PIPL/DSL Data Masking Rules
- Environment Promotion (Dev -> Prod) Release Checklist
