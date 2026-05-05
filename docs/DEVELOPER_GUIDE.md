# 开发者指南

本文档说明如何维护和扩展 `@product-dev` 插件。

## 1. 架构分层

```text
VS Code Extension Entry
  ↓
Chat Participant
  ↓
Command Router
  ↓
Command Handler
  ↓
Context Collector / Policy Loader / Prompt Compiler
  ↓
Language Model
  ↓
Artifact Writer
```

## 2. 关键源码

| 文件 | 说明 |
|---|---|
| `src/extension.ts` | 插件入口，注册 Chat Participant 和普通 VS Code command |
| `src/chat/participant.ts` | 处理 Copilot Chat 请求，规范化 slash command |
| `src/chat/command-router.ts` | 把命令路由到具体 command handler |
| `src/commands/shared.ts` | AI 文档生成类命令的通用执行管线（含 Skill 匹配 + 代码索引注入） |
| `src/prompt/prompt-compiler.ts` | 把命令、上下文、规则编译成 PromptPackage |
| `src/prompt/output-schemas.ts` | 每个命令的固定输出结构 |
| `src/context/repo-scanner.ts` | 扫描 repo 文件结构和关键文件 |
| `src/context/request-context.ts` | 收集编辑器选中代码、附件、请求上下文 |
| `src/code-index/indexer.ts` | 代码索引入口（缓存优先的结构快照） |
| `src/code-index/cache.ts` | 增量缓存管理器（mtime + SHA-256 hash） |
| `src/code-index/scanner.ts` | 6 种语言正则扫描器（TS/JS/Java/Python/SQL/Go） |
| `src/code-index/summary.ts` | 紧凑 Markdown context pack 渲染器 |
| `src/code-index/types.ts` | 索引系统类型定义 |
| `src/policies/policy-pack-loader.ts` | 加载本地 Policy Pack |
| `src/scaffold/project-initializer.ts` | `/init` 项目骨架生成器 |
| `src/loop/ralph-loop.ts` | Ralph-style Loop 状态管理 |
| `src/workflow/workflow.ts` | 命令顺序和下一步提示 |
| `src/writers/artifact-writer.ts` | 将输出写入 `docs/` |

## 3. 新增命令步骤

1. 在 `package.json` 中声明 slash command。
2. 在 `src/core/types.ts` 中扩展 `ProductDevCommand`。
3. 新建 `src/commands/<name>.command.ts`。
4. 在 `src/chat/command-router.ts` 中注册。
5. 在 `src/prompt/prompt-compiler.ts` 中配置 title、role、task、artifactPath。
6. 在 `src/prompt/output-schemas.ts` 中定义输出 Schema。
7. 在 `src/workflow/workflow.ts` 中定义 next step。
8. 更新 README 和 docs。
9. 增加测试。

## 4. 命令类型

### 4.1 AI Artifact Command

大多数命令都是这种类型：

```ts
const result = await runAiArtifactCommand(args, 'dq');
streamResult(args, result);
```

它会自动：

1. 读取 workspace。
2. 调用 `getCodeContext()` 获取项目代码结构索引（优先从缓存读取）。
3. 注入 `## Codebase Structural Index` 到 prompt context 最前面。
4. 根据 frontmatter 匹配本地/便携 Skill 文件。
5. 后端 API 测试命令时额外扫描 controller/route/DTO 端点。
6. 根据需要读取 git diff。
7. 加载 Policy Pack。
8. 编译 Prompt。
9. 调用语言模型。
10. 写入 artifact。
11. 输出下一步提示。

### 4.2 Non-AI Command

例如 `/init`、`/policy-scan`、`/loop-status`，主要操作本地文件或状态，不一定调用模型。

## 5. 代码注释规范

新增源码时建议包含：

```ts
/**
 * Purpose:
 * - 这个文件解决什么问题。
 *
 * Usage:
 * - 被哪个命令调用。
 *
 * Notes:
 * - 企业/银行场景下的注意事项。
 */
```

## 6. Prompt 设计规范

每个命令的 prompt 必须包含：

- Role
- Task
- Context
- Constraints
- Output Schema
- Policy Pack rules
- Open Questions
- Next Command

## 7. 测试建议

至少覆盖：

- command router
- prompt compiler
- policy pack loader
- project initializer
- artifact writer
- workflow next-step hints

### 7.1 代码索引测试

代码索引模块 `src/code-index/` 推荐覆盖：

- **scanner**: 每种语言的实体检测（类、函数、路由、DTO 等），空文件、超大文件、排除规则
- **cache**: buildIndex 增量构建、loadSnapshot/saveSnapshot、clearCache、目录排除
- **summary**: 空索引、纯一种类型、混合文件、路由/控制器/服务各频道、输出上限
- **indexer**: cache-first 路径、force-rebuild 路径、getFilesByKind、rescan

> 当前已有 83 个代码索引测试用例覆盖 scanner(54) + cache(17) + summary(17) + indexer(12)。

## 8. 发布建议

内部发布前执行：

```bash
npm run compile
npm run test
npm run package
```

然后用 VS Code 手工验证：

```text
@product-dev /help
@product-dev /init data
@product-dev /policy-scan
@product-dev /dq
```
