---
name: bank-data-engineering
description: Use this skill for bank-grade data engineering tasks including data contracts, STTM, DQ rules, reconciliation, lineage, scheduler design, privacy controls, production runbooks, cost controls, and data-review workflows. Trigger whenever the task mentions banking data, source-to-target mapping, DQ, reconciliation, audit, lineage, SLA, batch jobs, sensitive fields, regulatory controls, or production data release.
appliesTo: data,sql,dbschema,pipeline,datacontract,sttm,dq,reconcile,lineage,migration,scheduler,privacy,data-test,data-review,catalog,semantic,cost,runbook
triggers: data,sql,dq,sttm,reconcile,lineage,数据,对账,血缘,质量,银行,审计
---

# Bank Data Engineering

## Use this skill when

The task is about enterprise or banking data development, especially where traceability, audit evidence, privacy, SLA, reconciliation, and production operability matter.

## Workflow

1. Establish business purpose, owner, SLA, data grain, source systems, target consumers, and environment.
2. Check the data contract before designing SQL or pipelines.
3. Produce STTM before transformation implementation.
4. Design DQ, reconciliation, lineage, privacy, scheduler, and runbook together; they are not afterthoughts.
5. Flag missing policy pack files when thresholds, severity, retention, or privacy classification are company-specific.

## Deep reference

Read `references/bank-data-checklist.md` for the full control checklist.

## Output pattern

Return sections for data contract, STTM, SQL/pipeline design, DQ, reconciliation, lineage, privacy, scheduler, data tests, release gates, runbook, risks, and next command.
