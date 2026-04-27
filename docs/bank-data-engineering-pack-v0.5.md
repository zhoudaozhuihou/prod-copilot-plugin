# Bank Data Engineering Pack v0.5

## Purpose

This version upgrades `@product-dev` from a general fullstack SDLC helper into a bank-grade data engineering workflow assistant.

## New command groups

### Interactive setup

- `/init frontend`
- `/init backend`
- `/init data`
- `/init fullstack`
- `/intake`
- `/context`

### Data engineering

- `/datacontract`
- `/sttm`
- `/dq`
- `/reconcile`
- `/lineage`
- `/sql-translate`
- `/migration`
- `/scheduler`
- `/privacy`
- `/data-test`
- `/data-review`
- `/catalog`
- `/semantic`
- `/cost`
- `/runbook`

## Recommended data workflow

```text
/init data
/intake
/context
/plan
/data
/datacontract
/sttm
/dbschema
/sql
/dq
/reconcile
/lineage
/pipeline
/scheduler
/data-test
/privacy
/data-review
/release
/runbook
```

## Initialization behavior

`/init` creates a segmented workspace structure for frontend, backend, and data development. It also creates:

- `docs/00-intake/PROJECT_BACKGROUND_QUESTIONNAIRE.md`
- `docs/context/project-profile.yaml`
- `.product-dev/init-session.local.json`
- frontend/backend/data track directories
- data contract, STTM, DQ, reconciliation, and lineage templates
