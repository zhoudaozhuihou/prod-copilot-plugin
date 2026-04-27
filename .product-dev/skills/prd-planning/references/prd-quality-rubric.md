# PRD Quality Rubric

## Blocker issues

- Missing problem statement or goal.
- Requirements are not testable.
- User stories are too large for one implementation session.
- Dependencies are hidden or ordered incorrectly.
- Acceptance criteria are vague.

## Ralph story requirements

Each story must include:

- ID: US-001 style.
- Title: short action-oriented name.
- Type: UI/backend/data/API/test/release/documentation.
- Description: As a [user/role], I want [capability] so that [benefit].
- Acceptance criteria: concrete and checkable.
- Priority: dependency order first, then business priority.
- Dependencies: previous story IDs or external prerequisites.
- Validation evidence: typecheck/lint/test, visual verification, DQ/reconciliation, or release evidence.

## Splitting rule

If a story cannot be described in 2-3 sentences and verified independently, split it.
