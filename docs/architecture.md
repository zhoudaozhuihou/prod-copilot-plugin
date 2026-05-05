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
Code Index Layer
  - Regex-based structural scanner (6 languages)
  - Incremental cache (mtime + content hash)
  - Compact LLM context pack (~2-4k chars)
  - Cached to .product-dev/code-index-cache/
      |
      v
Context Layer
  - Code Index (cached structural map, injected first)
  - Repo scanner
  - Route detector
  - API detector
  - Git diff reader
  - Config loader
  - Skill loader (frontmatter-based matching)
      |
      v
Prompt Compiler
  - Codebase Structural Index
  - Optimized user input
  - Role prompt
  - Task prompt
  - Repository context
  - Backend API scan evidence
  - Governance constraints
  - Output schema
  - Loaded skills
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
