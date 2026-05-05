---
name: regulatory-reporting
description: Use this skill for designing data pipelines for regulatory reporting (e.g., Basel, CCAR, LCR, MAS, HKMA). It ensures BCBS 239 compliance, data lineage, and exact formatting required by regulators.
appliesTo: data,sql,pipeline,reconcile,lineage
triggers: regulatory,reporting,basel,bcbs239,ccar,监管报表
---

# Regulatory Reporting Skill

## Execution Guardrails
- **BCBS 239 Compliance**: All regulatory reports must have 100% automated data lineage from source to report. Manual adjustments must be explicitly tracked and audited.
- **Reconciliation**: The regulatory report totals must tie out perfectly to the General Ledger (GL) or source systems. Always generate a reconciliation SQL script alongside the report logic.
- **Immutability**: Regulatory outputs must be versioned and immutable.

## Workflow
1. **Source Mapping**: Map operational data to the regulatory data model.
2. **Rule Implementation**: Implement regulatory aggregation and classification rules exactly as specified.
3. **Reconciliation Design**: Design the GL tie-out and exception handling.
4. **Lineage Generation**: Document the exact field-to-field lineage.

## Output Requirements
- Regulatory Data Model
- SQL/Pipeline Implementation
- Reconciliation Plan (Source to GL to Report)
- BCBS 239 Compliance Checklist
