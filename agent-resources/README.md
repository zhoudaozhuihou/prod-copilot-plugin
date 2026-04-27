# Portable Agent Resources

This directory is the tool-neutral source of truth for prompts, output schemas, and skills. It is intentionally separate from VS Code extension source code so the same assets can be reused by Copilot, OpenCode, Claude Code, Codex, or another AI IDE.

## Precedence

1. `.product-dev/policy-packs/`
2. `.product-dev/prompts/`
3. `.product-dev/skills/`
4. `agent-resources/`
5. extension built-in defaults

## OpenCode migration

Use `AGENTS.md`, `.opencode/commands/*.md`, and `.opencode/agents/*.md` as shims that point to this folder instead of duplicating prompts.
