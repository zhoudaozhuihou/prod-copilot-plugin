# Ralph PRD Workflow v1.4

This package upgrades PRD generation and loop planning to a Ralph-style workflow.

## Why this exists

Long-running AI development fails when the model keeps all state in chat. This workflow stores durable progress in repository files:

- `docs/prd/*.md` for human-readable PRDs and story splits
- `scripts/ralph/prd.json` for machine-readable story state
- `scripts/ralph/progress.txt` for iteration notes
- `AGENTS.md` / `CLAUDE.md` for durable implementation patterns
- Git history for completed increments

## Recommended flow

```text
@product-dev /feature <idea>
@product-dev /prd <context or attachment>
@product-dev /story-split <source PRD>
@product-dev /prd-json <source PRD or story split>
@product-dev /ralph-readiness
@product-dev /loop <task>
```

## Command rules

### /prd

Produces a PRD with:

- clear problem and goals
- non-goals
- users/personas
- numbered functional requirements
- small user stories
- verifiable acceptance criteria
- quality criteria for UI, backend, data, and tests
- Ralph readiness notes

### /story-split

Splits large requirements into one-iteration stories. A good story:

- has one coherent outcome
- can be implemented in a fresh agent context
- has explicit dependencies
- has acceptance criteria that can be tested
- does not hide multiple features inside one title

### /prd-json

Converts PRD content to Ralph-compatible JSON. Required story fields:

```json
{
  "id": "US-001",
  "title": "...",
  "description": "...",
  "acceptanceCriteria": ["..."],
  "priority": 1,
  "passes": false,
  "notes": ""
}
```

### /ralph-readiness

Checks whether loop execution is safe. It should block if:

- stories are too large
- dependencies are unclear
- acceptance criteria are vague
- quality commands are missing
- no external memory files exist
- policy or security requirements are unresolved

## OpenCode compatibility

The same assets are portable:

```text
agent-resources/prompts/commands/prd.md
agent-resources/prompts/commands/story-split.md
agent-resources/prompts/commands/prd-json.md
agent-resources/prompts/commands/ralph-readiness.md
agent-resources/skills/prd-planning/
agent-resources/skills/ralph-prd/
agent-resources/skills/ralph-loop/
.opencode/commands/story-split.md
.opencode/commands/prd-json.md
.opencode/commands/ralph-readiness.md
```

## Human approval rule

Even when loop automation is enabled, PRD, policy, security, data privacy, production release, and destructive changes must remain human-reviewed.
