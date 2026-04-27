# Architecture

```text
VS Code Copilot Chat
  @product-dev
      |
      v
Chat Participant Handler
      |
      v
Command Router
      |
      +-- /brainstorm
      +-- /feature
      +-- /prd
      +-- /journey
      +-- /task
      +-- /api
      +-- /review
      +-- /test
      +-- /diff
      +-- /release
      |
      v
Context Layer
  - Repo scanner
  - Route detector
  - API detector
  - Git diff reader
  - Config loader
      |
      v
Prompt Compiler
  - Role prompt
  - Task prompt
  - Repository context
  - Governance constraints
  - Output schema
      |
      v
Language Model Adapter
  - Uses request.model first
  - Falls back to vscode.lm.selectChatModels
  - Deterministic fallback if unavailable
      |
      v
Artifact Writer
  - docs/product
  - docs/prd
  - docs/journey
  - docs/tasks
  - docs/api
  - docs/review
  - docs/test
  - docs/release
```
