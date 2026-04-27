# Diagram Workflow v1.7

This version adds diagram-aware SDLC support.

## New commands

- `@product-dev /architecture-diagram`
- `@product-dev /journey-diagram`
- `@product-dev /diagram`

## Diagram standard

- Use Mermaid diagram-as-code by default.
- Each diagram must include purpose, source evidence, assumptions, interpretation notes, owner, and update trigger.
- Do not invent systems, components, screens, data stores, or third parties. Unknown items must be labeled `TBD` or `Assumption`.

## Diagram insertion policy

All major SDLC artifacts now include a `Required Diagrams` section when diagrams would clarify implementation or governance. Examples:

- PRD: user flow, journey map, dependency map.
- Frontend: route map, component hierarchy, state transition.
- Backend/API: service boundary, request sequence, deployment.
- Data: ERD, lineage, pipeline DAG, DQ flow, reconciliation flow.
- Release/runbook: release gate flow, rollback flow, incident escalation.
