# VS Code Copilot Subagent Orchestration

## Conclusion

VS Code Copilot can use subagents when the current chat agent has access to the built-in `agent` / `runSubagent` tool. The recommended implementation is not to hard-code subagents inside the extension runtime. Instead, create workspace custom agents under `.github/agents/` and let a coordinator custom agent delegate focused work to worker agents.

This project therefore supports subagents in two layers:

1. `@product-dev` commands create subagent-ready assets and inject a delegation plan for complex tasks.
2. The generated `product-dev-coordinator` custom agent can run specialized VS Code Copilot subagents when native subagent support is available in the user's VS Code/Copilot environment.

## Commands

```text
@product-dev /agents-init
@product-dev /agents-scan
```

## Generated files

```text
.github/agents/product-dev-coordinator.agent.md
.github/agents/prd-planner.agent.md
.github/agents/design-system-engineer.agent.md
.github/agents/frontend-engineer.agent.md
.github/agents/springboot-engineer.agent.md
.github/agents/python-engineer.agent.md
.github/agents/sql-engineer.agent.md
.github/agents/bank-data-engineer.agent.md
.github/agents/quality-reviewer.agent.md
.github/agents/security-reviewer.agent.md
.github/agents/release-manager.agent.md

agent-resources/prompts/commands/subagent-orchestration.md
agent-resources/skills/subagent-orchestration/SKILL.md
.github/prompts/subagent-orchestration.prompt.md
.opencode/commands/subagent-plan.md
```

## When the system should use subagents

Use subagents when one of these is true:

- The task spans product + frontend + backend + data.
- The task is a review task where independent perspectives reduce bias.
- The task involves SQL, data quality, reconciliation, lineage, privacy, release, or security risk.
- The task requires repository exploration before implementation.
- The task is a Ralph loop readiness / story validation step.

Avoid subagents for small one-file edits, simple summaries, direct rewrites, and cases where one focused answer is enough.

## Recommended worker mapping

| Situation | Subagents |
|---|---|
| PRD / story split | `prd-planner`, `quality-reviewer` |
| DESIGN.md / UI design | `design-system-engineer`, `frontend-engineer` |
| Frontend implementation | `frontend-engineer`, `design-system-engineer`, `quality-reviewer` |
| Spring Boot implementation | `springboot-engineer`, `security-reviewer`, `quality-reviewer` |
| Python implementation | `python-engineer`, `security-reviewer`, `quality-reviewer` |
| NL2SQL / SQL review / SQL translation | `sql-engineer`, `bank-data-engineer`, `security-reviewer` |
| Bank data pipeline review | `bank-data-engineer`, `sql-engineer`, `quality-reviewer` |
| Release / Ralph readiness | `release-manager`, `quality-reviewer`, `security-reviewer` |

## Important limitations

- The `@product-dev` Chat Participant can generate files and prompt guidance, but native subagent execution is controlled by VS Code Copilot custom agents.
- If native subagent support is unavailable, the system still writes a manual `Subagent Delegation Plan` in the generated artifact.
- Nested subagents are disabled by default in VS Code; do not rely on recursive delegation unless the user explicitly enables it.
- Subagents should return concise findings, evidence, actions, and validation checks. They should not return long scratch work.
