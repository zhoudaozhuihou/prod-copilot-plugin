---
name: ralph-loop
description: Prepare, run, and review Ralph-style autonomous coding loops where each iteration starts with clean context, reads prd.json and progress.txt, implements one passes:false story, runs quality checks, commits, updates progress, and stops when all stories pass. Use for /loop, /loop-next, /ralph-readiness, long-running coding workflows, and autonomous implementation planning.
---

# Ralph Loop Skill

## Karpathy Execution Guardrails

Apply the shared `karpathy-guidelines` skill for non-trivial work:

- State assumptions before designing or changing anything.
- Prefer the smallest useful artifact over speculative completeness.
- Keep changes surgical and trace every recommendation to the user request or evidence.
- Convert the task into verifiable success criteria before calling it done.
- If project policy, user intent, or repository evidence is unclear, ask targeted questions instead of guessing.

## Workflow

1. Read `scripts/ralph/prd.json`.
2. Read `scripts/ralph/progress.txt`, especially Codebase Patterns.
3. Check branch from `branchName`.
4. Pick the highest-priority story where `passes:false`.
5. Implement exactly one story per iteration.
6. Run project quality checks.
7. Update AGENTS.md or CLAUDE.md only with reusable codebase learnings.
8. Mark the story `passes:true` only if evidence passes.
9. Append to progress.txt; never replace it.
10. Stop with COMPLETE only when all stories pass.

## Safety limits

- Do not work on multiple stories in one iteration.
- Do not commit broken code.
- Do not mark `passes:true` without validation evidence.
- Do not store long story-specific details in AGENTS.md.

## References

Read `references/progress-memory.md` and `references/quality-gates.md`.
