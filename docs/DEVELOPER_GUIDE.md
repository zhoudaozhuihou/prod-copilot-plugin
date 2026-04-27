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
| `src/commands/shared.ts` | AI 文档生成类命令的通用执行管线 |
| `src/prompt/prompt-compiler.ts` | 把命令、上下文、规则编译成 PromptPackage |
| `src/prompt/output-schemas.ts` | 每个命令的固定输出结构 |
| `src/context/repo-scanner.ts` | 扫描 repo 文件结构和关键文件 |
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
2. 扫描 repo。
3. 根据需要读取 git diff。
4. 加载 Policy Pack。
5. 编译 Prompt。
6. 调用语言模型。
7. 写入 artifact。
8. 输出下一步提示。

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
