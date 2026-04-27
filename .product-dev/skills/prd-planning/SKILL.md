---
name: prd-planning
description: Generate implementation-ready PRDs with Ralph-sized user stories, essential clarifying questions, explicit goals/non-goals, concrete acceptance criteria, and delivery-ready requirements. Use this skill when the user asks to create a PRD, plan a feature, write requirements, convert ideas into product scope, or prepare work for autonomous coding loops.
---

# PRD Planning Skill

## When to use

Use this skill for `/prd`, `/feature`, `/story-split`, `/task`, and any request that needs a requirements document suitable for developers, QA, and coding agents.

## Workflow

1. If the request is ambiguous, ask only 3-5 essential clarifying questions with lettered options so the user can answer quickly.
2. Define the problem, goals, non-goals, target users, constraints, success metrics, and release boundaries.
3. Convert requirements into small user stories that can be implemented and verified independently.
4. For every story, write concrete acceptance criteria. Avoid vague language like "works well" or "good UX".
5. Label story type: UI, backend, data, API, integration, test, release, or documentation.
6. Add validation evidence: typecheck/lint/test for code, browser/manual visual verification for UI, DQ/reconciliation for data.

## References

Read `references/prd-quality-rubric.md` before producing the final PRD.

## Output pattern

PRD overview → goals/non-goals → users → user journey → user stories → functional requirements → NFRs → dependencies → acceptance criteria → Ralph readiness notes → risks → open questions → next command.
