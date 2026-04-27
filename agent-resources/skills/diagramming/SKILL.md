---
name: diagramming
description: Generate and review Mermaid diagram-as-code for architecture, user journey, UI flow, API sequence, data lineage, ERD, pipeline DAG, DQ control, reconciliation, release, rollback, runbook, and incident workflows. Use for /architecture-diagram, /journey-diagram, /diagram, PRD, frontend, backend, API, data, release, and review artifacts that need visual documentation.
---

# Diagramming Skill

## Purpose

Create versionable, evidence-backed diagrams that help engineers, product managers, data developers, reviewers, and agents understand the system.

## Rules

1. Use Mermaid by default.
2. Prefer the smallest useful diagram set.
3. Every node and edge must be grounded in repo evidence, user input, PRD, DESIGN.md, SQL, or a stated assumption.
4. Include purpose, source evidence, diagram code, interpretation notes, owner, and update trigger.
5. Do not use diagrams as decoration; every diagram must support a decision, implementation step, review gate, or operational process.
6. For banking/data artifacts, include privacy boundaries, lineage, DQ, reconciliation, and audit flows when relevant.

## Workflow

1. Identify the artifact type and SDLC phase.
2. Select diagram types using `references/diagram-catalog.md`.
3. Generate Mermaid diagrams.
4. Validate against `references/mermaid-standards.md`.
5. Add maintenance rules and next command.
