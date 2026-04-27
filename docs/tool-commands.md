# Utility Tool Commands

Version 0.4.0 adds a utility tool layer. These commands can be called at any stage of the delivery workflow and are also available inside Ralph-style loops.

| Command | Purpose | Main Output |
|---|---|---|
| `/prompt` | Optimize a rough prompt into an enterprise-grade executable prompt. | `docs/tools/prompt-optimization.md` |
| `/summarize` | Summarize selected content, documents, or repository context. | `docs/tools/content-summary.md` |
| `/compress` | Compress long context into a compact briefing for Copilot, Claude Code, Codex, OpenCode, or Ralph Loop. | `docs/tools/context-compression.md` |
| `/doc-review` | Review prompts, PRDs, designs, SQL, release notes, or other artifacts. | `docs/tools/review-report.md` |
| `/rewrite` | Rewrite content for executive, product, technical, banking-grade, or implementation-ready use. | `docs/tools/rewrite.md` |
| `/checklist` | Generate execution, review, handoff, DoD, or release checklists. | `docs/tools/checklist.md` |

## Examples

```text
@product-dev /prompt 优化这个 prompt：阅读 React 代码生成 PRD，并给出 Journey 和卡点
```

```text
@product-dev /summarize 总结当前文档，输出给老板看的 1 页版
```

```text
@product-dev /compress 将当前需求、代码背景和限制压缩成 Claude Code / Codex 可执行上下文
```

```text
@product-dev /doc-review review 这份 PRD，按 Blocker/High/Medium/Low 给问题
```

```text
@product-dev /rewrite 将这段内容升级为银行管理层汇报风格
```

```text
@product-dev /checklist 为 Spring Boot + PostgreSQL 功能上线生成检查清单
```
