# @product-dev Skills

Skills follow the portable Agent Skills pattern:

```text
<skill-name>/
├── SKILL.md
├── references/
├── scripts/
├── examples/
└── evals/
```

`SKILL.md` must contain `name` and `description` frontmatter. The description is the primary discovery/trigger signal. Keep `SKILL.md` concise and move long standards, dialect matrices, examples, and rubrics to `references/`.

Run:

```text
@product-dev /skill-scan
@product-dev /skill-review
@product-dev /skill-run sql-review review this SQL
```
