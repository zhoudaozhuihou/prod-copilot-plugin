---
name: prompt-quality
description: Use this skill whenever a user gives a rough, vague, overloaded, or mixed-language request and the system needs to turn it into a precise execution prompt with role, goal, context, constraints, output schema, missing questions, assumptions, and next action. Also use it before product, frontend, backend, data, SQL, review, summary, rewrite, and loop commands to normalize user intent.
appliesTo: *
triggers: prompt,优化,需求,设计,review,总结,压缩
---

# Prompt Quality

## Karpathy Execution Guardrails

Apply the shared `karpathy-guidelines` skill for non-trivial work:

- State assumptions before designing or changing anything.
- Prefer the smallest useful artifact over speculative completeness.
- Keep changes surgical and trace every recommendation to the user request or evidence.
- Convert the task into verifiable success criteria before calling it done.
- If project policy, user intent, or repository evidence is unclear, ask targeted questions instead of guessing.

## Use this skill when

The user input is incomplete, ambiguous, too broad, or needs to be converted into an execution-ready prompt for Copilot, OpenCode, Claude Code, Codex, or an internal agent workflow.

## Workflow

1. Extract the user's real objective before rewriting wording.
2. Preserve hard constraints exactly, especially technology stack, database dialect, policy pack, environment, and output format.
3. Split the request into role, task, context, constraints, output schema, quality bar, and next command.
4. Ask only targeted questions when missing information blocks safe execution. Otherwise proceed with clearly labeled assumptions.
5. End with one concrete next step.

## Output pattern

Return optimized prompt, assumptions, missing context questions, suggested skills/policies to load, expected output artifacts, and next command.

## Safety boundary

Do not invent company policy, table schemas, credentials, production thresholds, or regulatory rules. Refer users to Policy Pack files for mandatory rules.
