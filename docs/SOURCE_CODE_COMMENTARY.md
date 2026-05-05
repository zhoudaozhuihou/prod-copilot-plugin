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
  │
  ├─ src/code-index/indexer.ts: 读取/构建代码结构索引（缓存优先）
  │   ├─ src/code-index/cache.ts: 增量缓存（mtime + 内容 hash）
  │   ├─ src/code-index/scanner.ts: 6 种语言正则扫描器
  │   └─ src/code-index/summary.ts: 编译为紧凑 Markdown context pack
  │
  ├─ src/backend/api-code-scanner.ts: 后端 API 端点扫描（按需）
  ├─ src/commands/shared.ts: loadRelevantSkills() 基于 frontmatter 匹配技能
  │
  ↓
src/ai/language-model.ts 调用 Copilot Chat 当前模型（context 已包含 Codebase Structural Index）
  ↓
src/commands/shared.ts 写入产物文件
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

- 调用代码索引 (`getCodeContext`) 获取项目结构快照，注入 `## Codebase Structural Index`。
- 后端 API 测试命令时调用 `api-code-scanner` 扫描端点。
- 加载本地/便携 Skill 文件（基于 YAML frontmatter 的 `name`/`appliesTo`/`triggers`/`description` 匹配）。
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

### `src/code-index/indexer.ts`

代码索引入口。负责：

- 提供 `getCodeContext()` API，所有命令执行时自动调用（在 `shared.ts` 中）。
- 优先从缓存 (`getCachedSummary`) 读取，避免每次命令重新扫描。
- 无缓存时调用 `buildIndex()` 全量构建索引。
- 提供 `rescan()` 强制重建、`getFilesByKind()` 按实体类型查询文件。

### `src/code-index/cache.ts`

增量缓存管理器。负责：

- `buildIndex()`: 遍历 workspace 收集文件，排除 `node_modules/`、`.git/`、`build/` 等目录，自动跳过索引自身的缓存目录。
- 对每个文件对比 mtime + size，未变更的文件复用缓存实体；变更的文件重新读取内容并计算 SHA-256 hash。
- 将索引结果持久化到 `.product-dev/code-index-cache/snapshot.json`（纯 JSON，不含文件内容）。
- 提供 `loadSnapshot()`、`getCachedSummary()`、`clearCache()` 接口。

### `src/code-index/scanner.ts`

正则轻量代码扫描器。负责：

- `detectLanguage()`: 根据文件扩展名（.ts/.tsx/.java/.py/.sql/.go/.rs 等 20+ 扩展）映射到 `CodeLanguage`。
- `scanFile()`: 根据语言分发到专用扫描函数。
- `scanTypeScript()`: 检测类、接口、枚举、函数、箭头函数导出、Express/Next.js 路由、React 组件。
- `scanJava()`: 检测类/接口/枚举/record、`@RestController` 控制器、Spring Boot 路由映射（`@GetMapping`/`@PostMapping`/`@PutMapping`/`@DeleteMapping`/`@PatchMapping`/`@RequestMapping`）、Lombok DTO、`@Service`、`@Repository`。
- `scanPython()`: 检测类、函数、FastAPI 路由（`@app.get`/`@router.post` 等）、Flask 路由、Pydantic 模型。
- `scanSql()`: 检测 `CREATE TABLE/VIEW`、`INSERT INTO/MERGE INTO`（含 schema 限定名）。
- `scanGo()`: 检测 type/struct/interface、函数/方法。
- `scanGeneric()`: 通用 fallback，匹配 `class/struct/trait` 和 `fn/def/function/func` 模式。
- 内置 `deduplicate()` 防止同一实体被多个模式匹配写入重复记录。

### `src/code-index/summary.ts`

紧凑 context pack 渲染器。负责：

- `renderSummary()`: 将索引结果编译为单一 Markdown 字符串（~2000-4000 字符），包含：
  - 概览（文件数、实体数）、语言分布、目录结构（前 2 层）
  - 控制器、API 路由、服务、DTO/模型各频道（按实体类型分组）
  - 类/接口/枚举（按目录分组）、SQL 表/视图、测试文件统计
- 输出上限 8000 字符，防止 context 过度占用。

### `src/code-index/types.ts`

类型定义。包含 `CodeLanguage`、`EntityKind`、`CodeEntity`、`CodeEdge`、`FileCacheEntry`、`CodeIndexSnapshot`、`IndexerConfig` 接口及默认配置。

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
