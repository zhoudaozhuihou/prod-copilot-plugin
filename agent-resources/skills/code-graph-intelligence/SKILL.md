---
name: code-graph-intelligence
description: Build GitNexus-inspired repository knowledge graph, impact analysis, and code wiki artifacts from codebase structure, imports, call flows, execution paths, git diff, and optional GitNexus MCP/CLI context. Use this skill for /code-graph, /impact-analysis, /code-wiki, architecture analysis, blast radius review, refactoring planning, and repo onboarding.
---

# Code Graph Intelligence Skill

Use this skill when the user needs codebase navigation, dependency mapping, blast-radius analysis, repo wiki generation, or agent-ready architectural context.

## Workflow

1. Identify available evidence: repository scan, active file, selected code, git diff, attachments, generated diagrams, and optional GitNexus output.
2. Build a graph hypothesis using only evidence-backed nodes and edges.
3. Separate confirmed edges from inferred edges.
4. Identify functional clusters, entry points, critical flows, API/data/UI boundaries, and high-risk coupling.
5. Generate a compact artifact that helps agents avoid blind edits.
6. Recommend the next command: `/impact-analysis`, `/architecture-diagram`, `/review`, or `/code-wiki`.

## Guardrails

- Do not invent dependencies or call chains.
- Mark missing symbol graph evidence clearly.
- Prefer GitNexus MCP/CLI context when attached.
- Include Mermaid diagrams when a visual graph improves understanding.
- For regulated projects, include security, data, audit, and release impact.
