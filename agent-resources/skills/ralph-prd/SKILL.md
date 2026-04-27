---
name: ralph-prd
description: Convert PRDs or feature specs into Ralph-compatible prd.json with dependency-ordered, one-iteration userStories, passes:false status, empty notes, strict acceptance criteria, and branchName ralph/<feature-name>. Use when the user asks for prd.json, Ralph format, story conversion, autonomous loop preparation, or PRD-to-agent task conversion.
---

# Ralph PRD Converter Skill

## Karpathy Execution Guardrails

Apply the shared `karpathy-guidelines` skill for non-trivial work:

- State assumptions before designing or changing anything.
- Prefer the smallest useful artifact over speculative completeness.
- Keep changes surgical and trace every recommendation to the user request or evidence.
- Convert the task into verifiable success criteria before calling it done.
- If project policy, user intent, or repository evidence is unclear, ask targeted questions instead of guessing.

## Job

Convert a Markdown PRD, feature design, task list, or user request into a Ralph-compatible `scripts/ralph/prd.json`.

## Output JSON contract

```json
{
  "project": "Project Name",
  "branchName": "ralph/feature-name",
  "description": "Short feature description",
  "userStories": [
    {
      "id": "US-001",
      "title": "Story title",
      "description": "As a role, I want capability so that benefit.",
      "acceptanceCriteria": ["Criterion 1", "Typecheck passes"],
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ]
}
```

## Conversion rules

1. One PRD user story becomes one JSON entry unless it is too large.
2. Split large stories before JSON conversion.
3. Order by dependencies: schema/data contract → backend/API → frontend/UI → integration → dashboard/report → tests/release.
4. All stories start with `passes:false` and `notes:""`.
5. Every story includes verifiable acceptance criteria.
6. Every story includes quality evidence: typecheck/lint/test, visual verification, DQ/reconciliation, or release evidence.
7. Branch name is kebab-case and prefixed with `ralph/`.

## References

Read `references/story-sizing.md` and `references/prd-json-schema.md`.
