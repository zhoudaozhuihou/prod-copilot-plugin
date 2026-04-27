# Source Code Commentary

本文档用来帮助团队理解源码组织方式。源码中已经给每个 TypeScript 文件增加 `Product Dev Copilot Source Note` 文件级注释；关键执行链路文件还补充了函数级说明。

## 1. 请求执行链路

```text
Copilot Chat 输入 @product-dev /dq
  ↓
package.json 声明 chat participant 与 command
  ↓
src/extension.ts 激活插件
  ↓
src/chat/participant.ts 接收请求
  ↓
src/chat/command-router.ts 识别 /dq 并路由
  ↓
src/commands/dq.command.ts 调用通用执行管线
  ↓
src/commands/shared.ts 扫描上下文、编译 prompt、调用模型、写文件
  ↓
src/prompt/prompt-compiler.ts 组合 role/task/constraints/schema
  ↓
src/prompt/context-builder.ts 加入 repo/git/config/policy context
  ↓
src/ai/language-model.ts 调用 Copilot Chat 当前模型
  ↓
src/writers/artifact-writer.ts 写入 docs/06-data/dq/data-quality-rules.md
```

## 2. 为什么 command handler 很薄

大多数 command 文件只有几行，例如：

```ts
export async function runDqCommand(args: CommandArgs): Promise<void> {
  const result = await runAiArtifactCommand(args, 'dq');
  streamResult(args, result);
}
```

这是故意设计的。好处是：

1. 命令行为统一。
2. Prompt 编译逻辑集中维护。
3. 产物写入逻辑集中维护。
4. Policy Pack 读取逻辑集中维护。
5. 后续新增命令成本低。

## 3. 关键文件讲解

### `src/extension.ts`

插件入口。负责：

- 创建 Output Channel。
- 注册 `@product-dev` Chat Participant。
- 注册命令面板快捷命令。

### `src/chat/participant.ts`

Chat 适配层。负责：

- 接收 Copilot Chat 请求。
- 规范化 slash command。
- 调用 command router。
- 提供 follow-up buttons，例如下一步命令、loop-next、loop-status。

### `src/chat/command-router.ts`

命令路由表。负责：

- 把 `/dq` 路由到 `runDqCommand`。
- 把未知命令路由到 `/help`。
- 输出完整 help 文档。

### `src/commands/shared.ts`

通用 AI Artifact 执行管线。负责：

- 扫描 repo。
- 读取 git diff。
- 编译 prompt。
- 调用模型。
- 写 artifact。
- 输出下一步提示。

### `src/prompt/prompt-compiler.ts`

Prompt 编译核心。负责：

- 根据命令选择 title。
- 根据命令选择 role。
- 根据命令选择 task。
- 根据命令选择 constraints。
- 根据命令选择 artifactPath。
- 插入 output schema。
- 插入 next step。

### `src/context/context-builder.ts`

上下文组装器。负责：

- repo map
- key file excerpts
- git status/diff
- user request
- `.product-dev/config.yaml`
- Policy Pack rules

### `src/policies/policy-pack-loader.ts`

本地规则加载器。负责：

- 扫描 `.product-dev/policy-packs/`。
- 识别规则层级。
- 识别规则类别。
- 渲染为 prompt context。
- 报告缺失规则和冲突风险。

### `src/scaffold/project-initializer.ts`

初始化器。负责：

- 根据 `/init frontend/backend/data/fullstack` 判断轨道。
- 创建前端、后端、数据开发目录。
- 生成问题清单。
- 生成项目画像模板。
- 初始化 Policy Pack。

### `src/loop/ralph-loop.ts`

循环执行状态机。负责：

- 创建外部状态文件。
- 保存当前目标、迭代次数、已完成步骤、下一步命令。
- 支持 `/loop-next` 继续下一轮。
- 支持 `/loop-status` 查看状态。
- 支持 `/loop-stop` 停止循环。

## 4. 注释维护规则

新增文件时必须包含文件级注释：

```ts
/**
 * Product Dev Copilot Source Note
 *
 * File: src/xxx.ts
 * Purpose: ...
 *
 * Usage rules:
 * - ...
 */
```

新增复杂函数时必须补充函数级注释：

```ts
/**
 * 说明函数解决的问题、执行步骤、企业场景注意事项。
 */
```

## 5. 不要把什么写进代码注释

- 真实账号
- 真实客户数据
- 内部密钥
- 生产环境地址
- 不应公开的监管解释
- 与公司内部审批相关的敏感细节

这些内容应在安全的内部系统或受控 Policy Pack 中管理。
