# Anthropic-Style Skills Guide for @product-dev

This project keeps prompts and skills portable so they can move from VS Code Copilot to OpenCode later.

## Skill anatomy

```text
skill-name/
├── SKILL.md
├── references/
├── scripts/
├── examples/
└── evals/
```

## Required metadata

```yaml
---
name: sql-review
description: Review SQL for production readiness, correctness, business semantics, join safety, performance, cost, data quality, reconciliation, lineage, privacy, and dialect-specific risks. Use this skill whenever...
---
```

`name` and `description` are the portable discovery contract. The description should include both what the skill does and when it should be used.

## Progressive disclosure

Keep `SKILL.md` short and practical. Put long checklists, dialect matrices, examples, and detailed rubrics into `references/`. This lets agents load the summary first and read extra files only when useful.

## Evaluation

Every important skill should include `evals/evals.json` with realistic prompts:

```json
{
  "skill_name": "sql-review",
  "evals": [
    {
      "id": 1,
      "prompt": "Review this BigQuery query for join amplification and cost risk...",
      "expected_output": "Severity-based findings with evidence, impact, fix, and validation SQL.",
      "files": []
    }
  ]
}
```

## Security

Skills should not contain hidden network calls, credential exfiltration, destructive commands, or surprising behavior. If a script is included, document its inputs, outputs, dependencies, and safe operating boundary.

## Commands

- `/skill-init` creates local skills.
- `/skill-scan` inventories skills and quality warnings.
- `/skill-review` reviews triggering, progressive disclosure, evals, and safety.
- `/skill-run <skill-name> <task>` runs a specific skill.

## OpenCode migration

OpenCode can read the same `agent-resources/skills/<skill>/SKILL.md` assets through `.opencode/commands` and `.opencode/agents` shims. Avoid embedding core skill logic directly in Copilot-only TypeScript.
