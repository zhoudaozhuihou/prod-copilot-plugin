# Code Graph Intelligence Commands

This version adds GitNexus-inspired code intelligence commands:

- `@product-dev /code-graph` — create a repository knowledge graph map.
- `@product-dev /impact-analysis` — analyze blast radius for a request or git diff.
- `@product-dev /code-wiki` — generate a durable code wiki for humans and AI agents.

## Relationship to GitNexus

GitNexus provides a deeper local index and MCP server. These commands do not vendor or require GitNexus. They use the built-in repo scanner by default and can consume GitNexus output when the user attaches it or when an MCP-enabled agent provides it.

## Recommended Workflow

```text
@product-dev /scan
@product-dev /code-graph
@product-dev /impact-analysis <change request or attach git diff>
@product-dev /code-wiki
@product-dev /architecture-diagram
```

## Evidence Rules

Every node and edge should be backed by repository evidence, attachments, or GitNexus output. Unknown edges must be labeled as assumptions.
