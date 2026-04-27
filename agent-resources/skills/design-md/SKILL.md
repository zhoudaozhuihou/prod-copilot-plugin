---
name: design-md
description: Extract or generate a Stitch-compatible DESIGN.md for frontend projects by reading UI source code, theme files, CSS variables, Tailwind configuration, component patterns, typography, spacing, responsive behavior, and visual guardrails. Use this skill when the user asks to analyze an existing UI, create a design system document, generate DESIGN.md, migrate UI guidance to OpenCode/Copilot/Stitch workflows, or make future AI-generated pages visually consistent.
appliesTo: design-md,ui-design,frontend,journey,review
triggers: DESIGN.md,design system,ui design,frontend design,视觉规范,设计系统,stitch
---

# DESIGN.md Skill

## Karpathy Execution Guardrails

Apply the shared `karpathy-guidelines` skill for non-trivial work:

- State assumptions before designing or changing anything.
- Prefer the smallest useful artifact over speculative completeness.
- Keep changes surgical and trace every recommendation to the user request or evidence.
- Convert the task into verifiable success criteria before calling it done.
- If project policy, user intent, or repository evidence is unclear, ask targeted questions instead of guessing.

## Use this skill when

The user wants to extract a frontend project's current visual language into `DESIGN.md`, generate a new design system for a feature/product, or make AI coding agents produce consistent UI.

## Workflow

1. Inspect repository evidence: `package.json`, routes, pages, components, layout files, CSS/SCSS/Less files, Tailwind config, theme providers, token files, Storybook stories, and existing UI docs.
2. Extract visual primitives: atmosphere, color roles, typography, spacing, radius, border, shadow, layout, responsive behavior, and motion.
3. Extract component rules: buttons, cards, inputs, tables, navigation, dialogs, forms, charts, alerts, empty/loading/error states, and focus/hover/disabled states.
4. Separate evidence-backed rules from assumptions or recommendations. Do not invent exact token values without evidence.
5. Produce a Stitch-compatible `DESIGN.md` that agents can read directly.

## References

Read `references/stitch-design-md-format.md` for the canonical section structure.
Read `references/frontend-evidence-checklist.md` to avoid missing important UI sources.

## Output pattern

Visual theme → color palette and roles → typography → component stylings → layout → depth/elevation → do/don't rules → responsive behavior → agent prompt guide → source evidence and assumptions → next command.

## Safety and quality boundaries

- Do not claim a brand token exists unless it is found in code or user context.
- Mark recommended tokens as recommendations.
- Include accessibility constraints for contrast, focus states, keyboard navigation, motion, and touch targets.
- Make the file portable for Copilot, OpenCode, Stitch-style tools, and other AI agents.
