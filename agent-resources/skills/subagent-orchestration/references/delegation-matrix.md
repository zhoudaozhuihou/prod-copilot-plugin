# Delegation Matrix

| Command / Situation | Recommended Subagents | Pattern |
|---|---|---|
| /prd, /story-split | prd-planner, quality-reviewer | sequential review |
| /design-md, /ui-design | design-system-engineer, frontend-engineer | focused research |
| /frontend | frontend-engineer, design-system-engineer, quality-reviewer | coordinator-worker |
| /springboot | springboot-engineer, security-reviewer, quality-reviewer | coordinator-worker |
| /python | python-engineer, security-reviewer, quality-reviewer | coordinator-worker |
| /nl2sql, /sql-review, /sql-translate | sql-engineer, bank-data-engineer, security-reviewer | parallel review |
| /data-review, /dq, /reconcile, /lineage | bank-data-engineer, sql-engineer, quality-reviewer | parallel review |
| /release, /ralph-readiness | release-manager, quality-reviewer, security-reviewer | gate review |
