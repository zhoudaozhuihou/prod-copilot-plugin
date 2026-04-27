# Skill Quality Rubric

## Required

- Frontmatter has `name` and `description`.
- Description states when to use the skill and includes realistic trigger contexts.
- Body explains workflow, output behavior, safety boundaries, and references.

## Good

- `SKILL.md` is concise and below 500 lines.
- Long details live in `references/`.
- Deterministic helpers live in `scripts/` and are documented.
- `evals/evals.json` has realistic prompts and expected behavior.

## Bad smells

- Description is only a noun phrase.
- Skill duplicates mandatory policy rules instead of referencing policy packs.
- Instructions are too broad or conflict with other skills.
- Skill contains hidden network behavior, secrets, or surprising side effects.
