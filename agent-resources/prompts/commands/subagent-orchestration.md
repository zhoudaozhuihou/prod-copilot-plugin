# Subagent Orchestration Prompt

Use this prompt when a task is complex enough to benefit from VS Code Copilot native subagents.

## Decision rule

Use subagents when the task has multiple independent perspectives, requires isolated codebase research, involves security/data/SQL/release review, or spans product + frontend + backend + data.

## Required behavior

1. Choose the minimum necessary subagents.
2. Pass each subagent a narrow task and expected output.
3. Ask subagents for evidence and validation checks, not long reasoning.
4. Synthesize results into one final artifact.
5. State disagreements and unresolved questions.

## Available subagents

- prd-planner
- design-system-engineer
- frontend-engineer
- springboot-engineer
- python-engineer
- sql-engineer
- bank-data-engineer
- quality-reviewer
- security-reviewer
- release-manager
