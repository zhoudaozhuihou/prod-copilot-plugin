---
name: gcp-data-engineering
description: Use this skill for designing and deploying data engineering workloads on Google Cloud Platform (GCP). Covers BigQuery schema/SQL design, Cloud Storage (GCS) data lakes, Dataflow (Apache Beam) streaming, Dataproc, Composer (Airflow), and GCP IAM/KMS security controls.
appliesTo: data,sql,pipeline,dbschema,release,runbook,architecture
triggers: gcp,google cloud,bigquery,dataflow,dataproc,cloud storage,gcs,composer,pubsub
---

# GCP Data Engineering Skill

## Execution Guardrails
- **BigQuery Design**: Enforce Partitioning (by time/ingestion) and Clustering on all fact tables to control query costs. Prefer `MERGE` statements over complex updates. Use nested and repeated fields (STRUCT/ARRAY) where appropriate to avoid expensive JOINs.
- **Compute Selection**: 
  - *Dataflow (Apache Beam)*: Default for unified batch/streaming pipelines.
  - *Dataproc*: Default only if migrating legacy Hadoop/Spark ecosystems.
  - *BigQuery SQL*: Default for ELT transformations inside the data warehouse.
- **Orchestration**: Default to Cloud Composer (Managed Airflow) for scheduling. Tasks should use native GCP operators (e.g., `BigQueryInsertJobOperator`).
- **Security & IAM**: Enforce Principle of Least Privilege using Service Accounts. Sensitive PII data must be encrypted using Cloud KMS and managed via Data Catalog / Policy Tags for column-level access control.
- **Cost Control**: Require dry-run estimations for large BigQuery queries. Setup budget alerts and slot reservations for predictable billing.

## Workflow
1. **Architecture & Storage**: Map source data to GCS (Data Lake) and BigQuery (Data Warehouse).
2. **Schema & SQL Development**: Generate BigQuery Standard SQL with explicit Partition/Cluster configurations.
3. **Pipeline Configuration**: Write Apache Beam / Dataflow logic or Composer DAGs for orchestration.
4. **Security Review**: Assign Policy Tags for PII fields and define IAM roles for the executing Service Account.
5. **Release & Migration Checklist**: Generate Terraform/Deployment Manager configurations and a rollback plan.

## Output Requirements
- GCP Architecture Blueprint (Storage, Compute, Orchestration)
- BigQuery DDL (with Partitioning & Clustering) and Standard SQL
- Composer (Airflow) DAG / Dataflow code snippets
- IAM Service Account & Policy Tag specifications
- Cost estimation & Cost Control mechanisms
