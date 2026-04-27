---
name: skill-creator
description: Create, review, refactor, and improve Agent Skills in Anthropic-style SKILL.md format. Use whenever the user wants to create a new skill, improve existing skills, optimize skill descriptions for triggering, add references/scripts/evals, convert prompts into reusable skills, or assess whether a skill is too broad, unsafe, overfit, or hard to migrate to OpenCode.
appliesTo: skill-init,skill-scan,skill-run,skill-review,prompt
triggers: skill,SKILL.md,技能,提示词能力,agent skill,opencode skill,claude skill
---

# Skill Creator

## Karpathy Execution Guardrails

Apply the shared `karpathy-guidelines` skill for non-trivial work:

- State assumptions before designing or changing anything.
- Prefer the smallest useful artifact over speculative completeness.
- Keep changes surgical and trace every recommendation to the user request or evidence.
- Convert the task into verifiable success criteria before calling it done.
- If project policy, user intent, or repository evidence is unclear, ask targeted questions instead of guessing.

## Use this skill when

The task involves creating, improving, testing, packaging, or reviewing a reusable skill.

## Skill anatomy

A good skill directory should look like this:

```text
skill-name/
├── SKILL.md
├── references/
├── scripts/
├── examples/
└── evals/
```

## Creation workflow

1. Capture intent: what the skill enables, when it should trigger, expected outputs, constraints, and risks.
2. Draft a concise `SKILL.md`: put triggering information in `description`, not buried in the body.
3. Move long or rarely needed details into `references/` and point to them from `SKILL.md`.
4. Add 2-3 realistic eval prompts with expected behavior.
5. Review for security: no hidden network calls, credential handling, exfiltration, or surprising side effects.
6. Run the skill on eval prompts, compare outputs, then revise.

## Quality rubric

Read `references/quality-rubric.md` when doing a detailed review.

## Output pattern

Return skill purpose, trigger cases, proposed directory tree, complete `SKILL.md`, recommended references/evals/scripts, risk notes, and next test command.
