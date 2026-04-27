# Karpathy Skill Optimization

This version optimizes the skill system using the ideas from `forrestchang/andrej-karpathy-skills`.

## What changed

- Added a portable `karpathy-guidelines` skill.
- Added a compact Karpathy execution contract reference to every domain skill.
- Updated the portable system prompt to apply the four principles before non-trivial engineering work.
- Updated AGENTS.md so OpenCode and other agent runners can load the same behavior.
- Added command prompt files for Copilot and OpenCode migration.

## Four principles

1. **Think before acting**: state assumptions, surface ambiguity, ask when unsafe to guess.
2. **Simplicity first**: avoid speculative features and unnecessary abstractions.
3. **Surgical changes**: touch only what the task requires; no drive-by refactors.
4. **Goal-driven execution**: define success criteria and verification evidence.

## How this interacts with existing skills

Domain skills such as `sql-review`, `nl2sql`, `prd-planning`, `ralph-loop`, `springboot-engineering`, and `design-md` still define the technical rubric. `karpathy-guidelines` defines the execution behavior that prevents overbroad or unverifiable work.

Priority remains:

`Policy Pack > Project Skill > Portable Skill > Generic Prompt Defaults`

If a company policy conflicts with a Karpathy rule, follow company policy and state the tradeoff.

## Recommended checks

Run:

```text
@product-dev /skill-scan
@product-dev /skill-review
@product-dev /skill-run karpathy-guidelines review the current implementation plan
```
