# Architecture Diagram Command Prompt

Generate enterprise architecture diagrams as Mermaid diagram-as-code.

## Required behavior

- Read repo context, PRD, API, backend, frontend, data, policy, and attachment context.
- Produce only evidence-backed diagrams; label assumptions explicitly.
- Include system context, container/component, deployment/runtime, API/integration sequence, data-flow, security/trust-boundary, and observability/failure-flow diagrams when applicable.
- For every diagram include purpose, source evidence, Mermaid code block, interpretation notes, owner, and update trigger.

## Mermaid types

Prefer `flowchart`, `sequenceDiagram`, `classDiagram`, `erDiagram`, `stateDiagram-v2`, and `journey`. Use `C4Context` only if the target renderer supports it.
