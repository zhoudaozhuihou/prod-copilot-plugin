---
name: bank-data-engineering
description: Use this skill for bank-grade data engineering tasks including data contracts, STTM, DQ rules, reconciliation, lineage, scheduler design, privacy controls, production runbooks, cost controls, and data-review workflows. Trigger whenever the task mentions banking data, source-to-target mapping, DQ, reconciliation, audit, lineage, SLA, batch jobs, sensitive fields, regulatory controls, or production data release.
appliesTo: data,sql,dbschema,pipeline,datacontract,sttm,dq,reconcile,lineage,migration,scheduler,privacy,data-test,data-review,catalog,semantic,cost,runbook
triggers: data,sql,dq,sttm,reconcile,lineage,数据,对账,血缘,质量,银行,审计
---

# Bank Data Engineering

## Karpathy Execution Guardrails

Apply the shared `karpathy-guidelines` skill for non-trivial work:

- State assumptions before designing or changing anything.
- Prefer the smallest useful artifact over speculative completeness.
- Keep changes surgical and trace every recommendation to the user request or evidence.
- Convert the task into verifiable success criteria before calling it done.
- If project policy, user intent, or repository evidence is unclear, ask targeted questions instead of guessing.

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
For specific banking scenarios, refer to the following specialized skills:
- `derivatives-pricing`: For complex derivatives and Greeks calculations.
- `regulatory-reporting`: For BCBS 239 compliant regulatory reports and GL reconciliation.
- `realtime-risk`: For intraday, streaming, and real-time risk calculations.

## Output pattern

Return sections for data contract, STTM, SQL/pipeline design, DQ, reconciliation, lineage, privacy, scheduler, data tests, release gates, runbook, risks, and next command.
