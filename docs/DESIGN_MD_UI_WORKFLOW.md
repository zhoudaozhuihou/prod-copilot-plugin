# DESIGN.md UI Workflow

This project supports a frontend UI design workflow compatible with Google Stitch-style `DESIGN.md`, Copilot, and OpenCode.

## Why DESIGN.md

`DESIGN.md` is a portable markdown design-system document. It gives AI agents a stable source of truth for how the UI should look and feel: visual atmosphere, colors, typography, component styling, layout, elevation, responsive behavior, and reusable agent prompts.

## Commands

### `/design-md`

Use this command to generate or update root `DESIGN.md`.

Typical use cases:

```text
@product-dev /design-md read the current React project and extract the UI design system into DESIGN.md
@product-dev /design-md generate a premium enterprise banking dashboard design.md for React + Tailwind
```

Behavior:

1. Scans frontend repository files.
2. Reads CSS/SCSS/Less, Tailwind config, theme files, component code, page layouts, dependencies, and existing docs.
3. Extracts visual rules and separates evidence-backed rules from assumptions.
4. Writes a root-level `DESIGN.md`.
5. Writes a reviewable docs copy under `docs/frontend/DESIGN.md`.

### `/ui-design`

Use this command to generate implementation-ready UI design guidance based on existing `DESIGN.md` or user design direction.

```text
@product-dev /ui-design design an API usage top 10 dashboard using current DESIGN.md
```

## Output structure

`DESIGN.md` follows the extended Stitch-compatible structure:

1. Visual Theme & Atmosphere
2. Color Palette & Roles
3. Typography Rules
4. Component Stylings
5. Layout Principles
6. Depth & Elevation
7. Do's and Don'ts
8. Responsive Behavior
9. Agent Prompt Guide
10. Source Evidence and Assumptions
11. Next Command

## OpenCode compatibility

The same prompt and skill assets are stored under:

```text
agent-resources/prompts/commands/design-md.md
agent-resources/prompts/output-schemas/design-md.md
agent-resources/skills/design-md/SKILL.md
.opencode/commands/design-md.md
.opencode/agents/design-system-engineer.md
.github/prompts/design-md.prompt.md
```

The migration rule is: Copilot/OpenCode are just execution shells; `agent-resources/` is the portable source of truth.
