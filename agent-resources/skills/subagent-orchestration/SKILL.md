---
name: subagent-orchestration
description: Use VS Code Copilot custom agents as subagents for complex product engineering, frontend/backend/data development, SQL review, security review, release readiness, Ralph loop planning, and multi-perspective validation.
---

# Subagent Orchestration Skill

Use this skill when a task is too broad for one context window or needs independent specialist review.

## Trigger conditions

- Full-stack work involving product, frontend, backend, and data.
- Review tasks where independent perspectives reduce anchoring bias.
- SQL/data/security/release tasks with high risk.
- Ralph loop readiness and story validation.
- Migration tasks involving multiple dialects, frameworks, or environments.

## Execution

1. Decide if delegation is useful.
2. Choose only necessary subagents.
3. Send narrow subtasks.
4. Require each subagent to return evidence, findings, actions, and validation checks.
5. Merge outputs into one prioritized result.

## Safety

Do not use nested subagents by default. Do not let subagents make broad unrelated changes. Do not delegate decisions that require human approval.
