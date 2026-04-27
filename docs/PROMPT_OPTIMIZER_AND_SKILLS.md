# Prompt Optimizer and Custom Skills Guide

This guide explains v0.9 behavior.

## 1. Why prompt optimization is mandatory

Company workflows cannot rely on raw user input because raw prompts are often missing role, scope, constraints, output format, governance context, and next step. v0.9 adds a deterministic optimizer before the model call for all major artifact commands.

## 2. Optimization pipeline

```text
Raw user input
→ intent detection
→ normalized goal
→ scope extraction
→ constraint preservation
→ required context listing
→ missing question detection
→ expected output binding
→ quality check injection
→ skill matching
→ final prompt package
```

## 3. What the optimizer does not do

It does not invent company rules, DQ thresholds, regulatory constraints, or business facts. Missing facts are turned into targeted questions or explicit assumptions.

## 4. Custom skill registry

Skills live under:

```text
.product-dev/skills/<skill-name>/SKILL.md
```

A skill is an instruction pack, not a shell script.

## 5. Skill metadata

```md
---
name: bank-data-engineering
description: Bank-grade data engineering guardrails
appliesTo: data,sql,dq,reconcile,lineage,data-review
triggers: dq,sttm,reconciliation,lineage,bank data
---
```

## 6. Commands

| Command | Purpose |
|---|---|
| `/skill-init` | Create example skills and README |
| `/skill-scan` | List available skills |
| `/skill-run <skill> <task>` | Run one skill directly |
| `/skill-review` | Review skill quality and gaps |

## 7. Auto-application

A normal command loads skills when:

1. `appliesTo` contains the command.
2. User text contains any trigger.
3. The optimizer suggests that skill.

## 8. Precedence

```text
Policy Pack > Custom Skill > Optimized User Input > Generic Prompt Defaults
```

If there is conflict, the model must state the conflict and follow the higher-precedence rule.

## 9. Recommended skill quality checklist

Each skill should contain:

- clear name and description
- command applicability
- trigger keywords
- role and scope
- required context
- constraints and non-goals
- output format
- quality checks
- safety/governance notes



## Anthropic-Style Skill Quality Update

Skills now use the portable directory pattern:

```text
<skill-name>/SKILL.md
<skill-name>/references/
<skill-name>/evals/
```

`SKILL.md` requires `name` and `description`. The description is used for triggering, while long details belong in `references/`. Use `/skill-scan` for inventory and `/skill-review` for quality review.
