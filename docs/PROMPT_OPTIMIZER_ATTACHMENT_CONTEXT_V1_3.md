# v1.3 Prompt Optimizer and Attachment Context

## Purpose

v1.3 makes prompt optimization a mandatory pre-processing step for every model-backed `@product-dev` command. It also adds Chat attachment / reference reading so users can attach PRD files, SQL files, schema DDL, screenshots exported as text, DESIGN.md, policy docs, or code snippets and have them injected as grounding context.

## Design Influences

This follows the main ideas from `copilot-prompt-optimizer`:

- intent recognition before prompt expansion
- context awareness from active editor, selection, and surrounding code
- multi-version optimization: concise, balanced, detailed
- structured prompt output with role, objective, scope, constraints, output format, quality bar, and avoid-list
- local fallback strategy that does not require a separate API key

## Command-wide Flow

```text
User raw input
→ collect request context
→ read active editor / selected code / surrounding code
→ read Chat attachments and file references
→ optimize user input
→ load policy packs
→ load portable prompts
→ load matching skills
→ compile final prompt package
→ call selected Copilot model
→ write artifact
→ suggest next command
```

## Attachment Support

The extension reads VS Code Chat request references and variables when present. Supported text-like attachments include:

- Markdown, TXT, CSV, TSV
- SQL, DDL, DML
- JSON, JSONC, YAML, XML
- Java, Python, TypeScript, JavaScript, React, Vue, CSS, HTML
- Gradle, properties, env-like config files

Binary files are not injected directly. They are summarized with a warning and the user should attach text exports or source files instead.

## New Command

```text
@product-dev /attachments
```

This command shows the active editor context and readable attachments that the extension can see before running a workflow command.

## Recommended Usage

```text
@product-dev /attachments
@product-dev /nl2sql 基于附件中的DDL生成BigQuery SQL
@product-dev /sql-review review附件中的SQL，重点检查join放大、DQ、成本和隐私风险
@product-dev /design-md 读取附件中的前端组件和theme文件，整理DESIGN.md
```

## OpenCode Migration

The optimizer is also stored as portable assets:

```text
agent-resources/prompts/commands/prompt-input-optimizer.md
agent-resources/prompts/output-schemas/prompt-input-optimizer.md
agent-resources/skills/prompt-input-optimizer/SKILL.md
.opencode/commands/prompt-input-optimizer.md
.github/prompts/prompt-input-optimizer.prompt.md
```

This keeps the prompt/skill assets independent from VS Code-specific code and easier to migrate to OpenCode later.
