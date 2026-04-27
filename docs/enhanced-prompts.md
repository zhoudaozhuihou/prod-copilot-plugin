# Enhanced Prompt System

The prompt system has three layers:

1. System prompt: enterprise AI SDLC behavior, traceability, safety, auditability, and next-step contract.
2. Specialist role prompt: command-specific expertise such as PM, UX, frontend, Spring Boot, Python, data, SQL, QA, or release.
3. Output schema: stable document shape for generated artifacts.

Runtime files:

- `src/prompt/prompt-compiler.ts`
- `src/prompt/output-schemas.ts`
- `src/ai/language-model.ts`

Prompt reference files:

- `prompts/system/enhanced-product-dev-system.md`
- `prompts/workflow/ordered-workflow.md`
- `prompts/workflow/ralph-loop.md`
- `prompts/commands/*.md`
