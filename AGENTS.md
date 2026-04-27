# AGENTS.md

This repository uses portable AI resources so the same prompt/skill system works with VS Code Copilot now and OpenCode later.

## Startup Rules

1. Read `.product-dev/config.yaml`.
2. Read `.product-dev/policy-packs/` for mandatory governance rules.
3. Read `.product-dev/prompts/` for project-specific prompt overrides.
4. Read `.product-dev/skills/` and `agent-resources/skills/` as instruction packs.
5. Read `agent-resources/prompts/commands/` for command prompts.

## SQL Commands

- NL2SQL: `agent-resources/prompts/commands/nl2sql.md`
- SQL translation: `agent-resources/prompts/commands/sql-translate.md`
- SQL review: `agent-resources/prompts/commands/sql-review.md`

## Rule

Do not duplicate prompt logic in IDE-specific files. IDE-specific files should point to portable resources.


## Karpathy Execution Rules

For non-trivial engineering tasks, also load `agent-resources/skills/karpathy-guidelines/SKILL.md` or `.product-dev/skills/karpathy-guidelines/SKILL.md` when present.

1. State assumptions before changing code, SQL, PRD, or architecture.
2. Prefer simple, minimal changes over speculative abstractions.
3. Keep changes surgical; do not refactor unrelated code or documents.
4. Define success criteria and verification checks before marking work complete.
5. Push back on unsafe, broad, or unverifiable requests with a smaller safer alternative.
