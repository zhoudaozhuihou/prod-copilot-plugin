# Policy Pack Overlay v0.6

## Why this exists

Company, department, country, project, and environment rules vary. DQ thresholds, quality gates, privacy controls, release gates, SQL standards, naming conventions, and review checklists should not be hardcoded into generic prompts.

v0.6 adds a local Policy Pack Overlay so users can add rule files under a predictable directory and have all commands load those rules automatically.

## Directory

```text
.product-dev/policy-packs/
├── global/
├── company/
├── department/
├── country/
├── project/
└── environment/
    ├── dev/
    ├── uat/
    └── prod/
```

## Precedence

Later layers override earlier layers:

```text
global < company < department < country < project < environment
```

## Recommended files

```text
dq-rules.yaml
quality-gates.yaml
data-contract-standard.yaml
sttm-standard.md
reconciliation-standard.yaml
lineage-standard.yaml
privacy-standard.yaml
security-standard.yaml
sql-standard.yaml
naming-conventions.yaml
scheduler-standard.yaml
release-gates.yaml
runbook-standard.md
review-checklist.md
business-glossary.md
```

## Interaction flow

```text
@product-dev /init fullstack
@product-dev /policy-intake
# user fills docs/00-intake/POLICY_PACK_QUESTIONNAIRE.md
# user edits .product-dev/policy-packs/**
@product-dev /policy-scan
@product-dev /policy-review
@product-dev /plan
```

## How prompts use policies

The repository scanner loads `.product-dev/policy-packs/**` into the prompt context. Commands such as `/dq`, `/quality`, `/data-review`, `/privacy`, `/release`, and `/runbook` must apply the loaded rules before using generic defaults.

