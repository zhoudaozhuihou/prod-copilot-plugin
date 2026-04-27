# Prompt Input Optimizer Command Prompt

Use this portable prompt when a command receives raw user input. The goal is to convert a weak request into an execution brief before the domain prompt runs.

## Required Optimization Steps

1. Recognize intent before expanding the task.
2. Preserve the user's original goal and non-negotiable wording.
3. Extract objective, scope, constraints, output format, quality bar, and avoid-list.
4. Inject available context from active editor, selected code, repository scan, policy packs, skills, and chat attachments.
5. Generate missing-context questions instead of inventing company-specific facts.
6. Produce three variants: Concise, Balanced, Detailed.
7. Bind the result to the command output schema.

## Safety Rules

- Do not invent schema fields, DQ thresholds, privacy rules, quality gates, or release gates.
- If attachments are present, use them as first-class grounding context.
- If attachments are binary or unreadable, state that they were not injected and ask for text exports.
- If user intent conflicts with loaded policies, follow policy and explain the conflict.
