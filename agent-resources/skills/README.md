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


## Karpathy-guided execution

All skills in this package should be used together with `karpathy-guidelines` for non-trivial work. This adds four behavior constraints: think before acting, simplicity first, surgical changes, and goal-driven verification. Domain skills define *what good means*; Karpathy guidelines define *how the agent should work without causing unnecessary scope, complexity, or side effects*.
