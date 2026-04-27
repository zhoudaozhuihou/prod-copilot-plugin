# Company Product Dev Copilot

> 企业级 VS Code Copilot Chat `@product-dev` 插件：面向产品设计、前端开发、后端开发、银行级数据开发、质量门禁、Policy Pack 本地规则覆盖、Ralph-style Looping、提示词优化与文档 Review 的全流程研发助手。

当前版本：**v1.6.0 VS Code Copilot Subagent Orchestration Edition**

---

## 1. 这个项目解决什么问题

很多团队在使用 Copilot / AI IDE 时会遇到这些问题：

1. Prompt 分散，每个人写法不同，输出不可控。
2. 需求、PRD、API、代码、测试、发布文档互相脱节。
3. 前端、后端、数据开发的交付物标准不一致。
4. 银行/金融场景对 DQ、对账、血缘、隐私、审计、发布门禁有强要求。
5. 每个公司、部门、国家、项目、环境都有自己的规则，不能只依赖通用 prompt。
6. 长任务需要循环推进，但又不能完全无人值守。

本插件提供一个统一入口：

```text
@product-dev
```

它把研发流程拆成可执行、可审计、可持续迭代的命令，并把输出落到 repo 的 `docs/`、`.product-dev/` 等目录中。

---

## 2. 核心能力概览

| 能力域 | 代表命令 | 主要产物 |
|---|---|---|
| 项目初始化 | `/init`, `/intake`, `/context` | 初始目录、问题清单、项目画像 |
| 本地规则覆盖 | `/policy-init`, `/policy-scan`, `/policy-review` | Policy Pack、规则清单、冲突分析 |
| 产品设计 | `/brainstorm`, `/feature`, `/prd`, `/journey` | 头脑风暴、功能设计、PRD、用户旅程 |
| Ralph PRD | `/story-split`, `/prd-json`, `/ralph-readiness` | 小步故事拆分、Ralph prd.json、循环执行准备检查 |
| 前端开发 | `/frontend` | 页面/组件/状态/API Hook/测试设计 |
| 后端开发 | `/backend`, `/springboot`, `/python` | 服务/API/领域模型/测试/配置设计 |
| 数据开发 | `/data`, `/sql`, `/dbschema`, `/pipeline` | 数据模型、SQL、Schema、Pipeline |
| 银行数据工程 | `/datacontract`, `/sttm`, `/dq`, `/reconcile`, `/lineage`, `/privacy`, `/runbook` | 数据契约、STTM、DQ、对账、血缘、隐私、运维 |
| 工具命令 | `/prompt`, `/summarize`, `/compress`, `/doc-review`, `/rewrite`, `/checklist` | Prompt 优化、总结、压缩、Review、改写、清单 |
| 自定义 Skill | `/skill-init`, `/skill-scan`, `/skill-run`, `/skill-review` | 本地 Skill 注册、扫描、运行、治理 Review |
| VS Code Subagents | `/agents-init`, `/agents-scan` | `.github/agents/*.agent.md` 自定义 Agent、复杂任务 subagent 编排 |
| 循环执行 | `/loop`, `/loop-next`, `/loop-status`, `/loop-stop` | 外部状态文件、TODO、迭代记录 |
| 交付治理 | `/quality`, `/review`, `/test`, `/diff`, `/release` | 门禁、Review、测试、影响分析、发布包 |

---


---

## Ralph PRD / Loop 工作流

本版本把 PRD 相关命令升级为更适合长任务循环执行的模式。核心原则是：**PRD 先形成稳定 Markdown，再拆分为一轮一个小故事，最后转换为可持久化的 `prd.json` 和 `progress.txt` 记忆文件**。

推荐流程：

```text
@product-dev /feature <功能想法>
@product-dev /prd <需求背景或附件>
@product-dev /story-split <把 PRD 拆成一轮一个 story>
@product-dev /prd-json <转换为 Ralph-style prd.json>
@product-dev /ralph-readiness <检查是否可以进入 loop>
@product-dev /loop <开始受控循环>
```

新增产物：

```text
docs/prd/ralph-story-split.md
docs/prd/ralph-prd-json.md
docs/prd/ralph-readiness-review.md
scripts/ralph/prd.json.example
scripts/ralph/progress.txt
scripts/ralph/prompt.md
scripts/ralph/CLAUDE.md
scripts/ralph/ralph.sh
agent-resources/skills/prd-planning/
agent-resources/skills/ralph-prd/
agent-resources/skills/ralph-loop/
```

### `/prd`

现在 `/prd` 不只是生成产品文档，还会输出可执行 user stories。每个 story 必须有稳定 ID、优先级、依赖、验收标准和验证证据。UI story 需要浏览器或人工视觉验证；数据 story 需要 DQ / reconciliation 验证；代码 story 需要 typecheck / lint / test 或等价检查。

### `/story-split`

用于把过大的 PRD 或 feature 拆成 Ralph-sized stories。要求每个 story 能在一个新的 agent context 中独立完成，且依赖顺序清晰。

### `/prd-json`

用于生成 Ralph-compatible `prd.json` 内容。默认输出到 `docs/prd/ralph-prd-json.md`，其中包含可复制到 `scripts/ralph/prd.json` 的 JSON block。所有 story 初始 `passes` 必须为 `false`。

### `/ralph-readiness`

进入 loop 前的门禁检查。会检查：story 是否过大、依赖是否正确、验收标准是否可验证、质量命令是否明确、`progress.txt` / `AGENTS.md` / `CLAUDE.md` 是否可作为外部记忆、是否仍存在 Blocker。

## 3. 安装与开发运行

### 3.1 解压并安装依赖

```bash
unzip company-product-dev-copilot-ralph-prd-skills-v1.4.0.zip
cd company-product-dev-copilot
npm install
npm run compile
```

### 3.2 在 VS Code 中调试

```bash
code .
```

然后按 `F5` 启动 **Extension Development Host**。

在新窗口的 Copilot Chat 中输入：

```text
@product-dev /help
```

### 3.3 打包 VSIX

```bash
npm run package
```

生成 `.vsix` 后可以在 VS Code 中通过：

```text
Extensions → Install from VSIX...
```

安装到本地或内部插件市场。

---

## 4. 最推荐的首次使用流程

### 4.1 全栈项目

```text
@product-dev /init fullstack
@product-dev /policy-intake
@product-dev /policy-scan
@product-dev /intake
@product-dev /context <粘贴你的项目背景答案>
@product-dev /plan
```

### 4.2 只做前端项目

```text
@product-dev /init frontend
@product-dev /intake
@product-dev /context <补充业务背景、用户角色、页面目标、设计系统约束>
@product-dev /brainstorm
@product-dev /feature
@product-dev /frontend
@product-dev /test
@product-dev /review
```

### 4.3 只做后端项目

```text
@product-dev /init backend
@product-dev /intake
@product-dev /context <补充业务能力、API、权限、事务、性能、安全要求>
@product-dev /api
@product-dev /backend
@product-dev /springboot
# 或
@product-dev /python
@product-dev /test
@product-dev /review
```

### 4.4 银行数据开发项目

```text
@product-dev /init data
@product-dev /policy-init
@product-dev /policy-intake
@product-dev /policy-scan
@product-dev /intake
@product-dev /context <补充源系统、目标表、SLA、DQ、对账、血缘、隐私、调度要求>
@product-dev /plan
@product-dev /data
@product-dev /datacontract
@product-dev /sttm
@product-dev /dbschema
@product-dev /sql
@product-dev /dq
@product-dev /reconcile
@product-dev /lineage
@product-dev /pipeline
@product-dev /scheduler
@product-dev /data-test
@product-dev /privacy
@product-dev /data-review
@product-dev /release
@product-dev /runbook
```

---

## 5. `/init` 技术栈驱动初始化规则

`/init` 已改为 **Stack-driven Init**。它不会再因为你说“后端项目”就同时生成 Java 和 Python 两套结构，也不会因为你说“数据项目”就生成所有数据库目录。

核心原则：

```text
用户输入什么技术栈，就只生成对应技术栈的项目目录、标准文件和 AI Agent 配置。
没有说清楚的技术栈，不猜测；生成 decision-required 文件并提问。
```

### 5.1 推荐写法

前端 React：

```text
@product-dev /init frontend react copilot opencode
```

Java Spring Boot 后端：

```text
@product-dev /init backend java springboot copilot opencode
```

Python FastAPI 后端：

```text
@product-dev /init backend python fastapi copilot opencode
```

银行数据开发 + PostgreSQL：

```text
@product-dev /init data postgresql copilot opencode
```

全栈 React + Spring Boot + PostgreSQL：

```text
@product-dev /init fullstack react springboot postgresql copilot opencode
```

全栈 React + FastAPI + BigQuery：

```text
@product-dev /init fullstack react python fastapi bigquery copilot opencode
```

### 5.2 生成结果示例

如果执行：

```text
@product-dev /init backend java springboot
```

只生成：

```text
backend/java-springboot/
docs/05-backend/springboot/
.github/copilot-instructions.md
.github/instructions/backend-springboot.instructions.md
.github/prompts/product-dev-workflow.prompt.md
AGENTS.md
.opencode/
.product-dev/
docs/00-intake/
docs/context/
```

不会生成：

```text
backend/python-fastapi/
backend/python-flask/
```

如果执行：

```text
@product-dev /init data postgresql
```

只生成 PostgreSQL 相关 SQL 目录：

```text
data/sql/postgresql/
```

不会生成：

```text
data/sql/oracle/
data/sql/bigquery/
data/sql/maxcompute/
```

除非用户明确输入这些引擎。

### 5.3 模糊输入的处理方式

如果用户只输入：

```text
@product-dev /init backend
```

插件不会强行创建 Java + Python。它会生成：

```text
backend/_decision-required/README.md
docs/00-intake/PROJECT_BACKGROUND_QUESTIONNAIRE.md
docs/context/project-profile.yaml
.product-dev/init-session.local.json
```

并要求用户补充：

```text
后端技术栈是 Java Spring Boot、Python FastAPI/Flask、Node、Go，还是其他？
```

用户补充后，再重新执行：

```text
@product-dev /init backend java springboot
```

### 5.4 Copilot / opencode 标准内容

初始化时会根据用户输入生成 AI IDE 必备内容。

Copilot：

```text
.github/copilot-instructions.md
.github/instructions/product-dev.instructions.md
.github/instructions/<stack>.instructions.md
.github/prompts/product-dev-workflow.prompt.md
.github/pull_request_template.md
.vscode/extensions.json
.vscode/settings.json
```

opencode / 通用 Agent：

```text
AGENTS.md
.opencode/opencode.jsonc
.opencode/agents/product-architect.md
.opencode/agents/code-reviewer.md
.opencode/agents/data-engineer.md    # 仅数据轨道生成
.opencode/commands/plan.md
.opencode/commands/review.md
.opencode/commands/loop-next.md
```

这些文件会显式写入“只允许处理用户选择的技术栈”的规则，避免 Agent 误生成无关目录。

### 5.5 初始化后的交互要求

执行 `/init` 后，建议继续：

```text
@product-dev /intake
@product-dev /context <你的项目背景、技术栈、规则、约束>
@product-dev /policy-intake
@product-dev /policy-scan
@product-dev /plan
```

这样后续命令会基于真实的公司背景、部门规范、国家规则、技术栈和数据治理约束生成结果。

---

## 6. Policy Pack 本地规则机制

不同公司、部门、国家、项目和环境的规则不同，所以本项目不把 DQ、门禁、隐私、发布规则写死在代码里，而是允许用户在固定目录添加本地规则。

### 6.1 推荐目录

```text
.product-dev/policy-packs/
  global/
  company/
  department/
  country/
  project/
  environment/
    dev/
    uat/
    prod/
```

### 6.2 推荐规则文件

```text
.product-dev/policy-packs/company/dq-rules.yaml
.product-dev/policy-packs/company/quality-gates.yaml
.product-dev/policy-packs/company/security-standard.yaml
.product-dev/policy-packs/company/privacy-standard.yaml
.product-dev/policy-packs/company/sql-standard.yaml

.product-dev/policy-packs/department/data-contract-standard.yaml
.product-dev/policy-packs/department/sttm-standard.md
.product-dev/policy-packs/department/reconciliation-standard.yaml
.product-dev/policy-packs/department/lineage-standard.yaml
.product-dev/policy-packs/department/scheduler-standard.yaml

.product-dev/policy-packs/country/README.md
.product-dev/policy-packs/project/naming-conventions.yaml
.product-dev/policy-packs/project/review-checklist.md
.product-dev/policy-packs/project/business-glossary.md

.product-dev/policy-packs/environment/prod/release-gates.yaml
.product-dev/policy-packs/environment/prod/runbook-standard.md
```

### 6.3 规则优先级

默认优先级：

```text
global < company < department < country < project < environment
```

含义：

1. `global` 是基础规则。
2. `company` 覆盖通用规则。
3. `department` 覆盖公司通用规则。
4. `country` 用于国家/地区监管差异。
5. `project` 用于项目本身特殊规则。
6. `environment` 用于 dev/uat/prod 环境差异，生产环境规则通常最严格。

### 6.4 推荐交互流程

```text
@product-dev /policy-init
@product-dev /policy-intake
# 用户编辑 .product-dev/policy-packs/ 下的规则文件
@product-dev /policy-scan
@product-dev /policy-review
```

### 6.5 重要使用原则

- 不要让 AI 猜测公司 DQ 阈值、发布门禁、隐私策略。
- 如果规则文件缺失，命令应明确列出缺失项。
- 如果规则冲突，按优先级处理，并在输出中说明冲突。
- 规则文件建议随项目代码一起版本化，但不要提交真实密钥、token、密码或敏感样本数据。

---

## 7. Ralph-style Looping 使用规则

Ralph Loop 的目标是让长任务逐轮推进，但保持外部状态、可暂停、可检查。

### 7.1 命令

```text
@product-dev /loop <任务描述>
@product-dev /loop-next
@product-dev /loop-status
@product-dev /loop-stop
```

### 7.2 状态文件

```text
.product-dev/ralph-loop.local.json
.product-dev/RALPH_LOOP_TODO.md
```

### 7.3 建议使用方式

```text
@product-dev /loop 为当前 React + Spring Boot + PostgreSQL 项目完成从需求到发布的交付设计
@product-dev /loop-status
@product-dev /loop-next
```

企业环境默认推荐 guided mode：每轮完成后由用户确认继续，避免 AI 在缺少审批的情况下连续修改大量内容。

---

## 8. 命令完整清单

| 命令 | 说明 |
|---|---|
| `/init` | Initialize .product-dev configuration and docs folders. |
| `/scan` | Scan current repository and generate a repo map. |
| `/plan` | Create an ordered delivery plan and recommended command sequence for the current task. |
| `/loop` | Start a Ralph-style loop using external state and execute iterative workflow steps. |
| `/loop-next` | Continue the next pending Ralph loop iteration from .product-dev/ralph-loop.local.json. |
| `/loop-status` | Show current Ralph loop state, progress, next command, and outstanding tasks. |
| `/loop-stop` | Stop the active Ralph loop and mark it as paused/stopped. |
| `/prompt` | Optimize rough prompts into enterprise-grade prompts with role, context, constraints, output schema, and evaluation criteria. |
| `/summarize` | Summarize selected text, documents, or repository context into decision-ready notes. |
| `/compress` | Compress long context into a compact briefing for Copilot, Claude Code, Codex, or Ralph loop execution. |
| `/doc-review` | Review prompts, documents, PRDs, designs, SQL, or release notes with severity and actionable fixes. |
| `/rewrite` | Rewrite or upgrade content for executive, product, technical, banking-grade, or implementation-ready use. |
| `/checklist` | Generate execution checklists, DoD, review checklists, handoff checklists, and acceptance checklists. |
| `/policy-init` | Create local policy pack folders and rule templates for company, department, country, project, and environment overlays. |
| `/policy-intake` | Ask interactive questions to identify which company/department/country/project rules must be supplied. |
| `/policy-scan` | Scan .product-dev/policy-packs and policies folders, inventory loaded rules, and detect missing policy files. |
| `/policy-review` | Review policy pack completeness, conflicts, precedence, and applicability to the current workflow. |
| `/brainstorm` | Brainstorm product opportunities, feature ideas, experiments, and MVP options. |
| `/feature` | Convert brainstorm ideas into structured feature design. |
| `/prd` | Generate or update PRD from user input and repository context. |
| `/journey` | Generate user journey and identify friction points from frontend code. |
| `/frontend` | Design or implement frontend pages, components, state management, validation, tests, and accessibility. |
| `/backend` | Design backend services, APIs, domain model, security, observability, and tests. |
| `/springboot` | Generate or review Java Spring Boot service design, controllers, DTOs, services, repositories, tests, and configuration. |
| `/python` | Generate or review Python backend design, FastAPI/Flask services, data services, tests, and packaging. |
| `/data` | Design data development solution: data model, ingestion, transformation, quality, lineage, governance, and serving. |
| `/sql` | Generate or optimize SQL for PostgreSQL, MaxCompute, BigQuery, Oracle, and other engines. |
| `/dbschema` | Design or review database schema, indexes, partitions, constraints, and migration scripts. |
| `/pipeline` | Design data pipelines, orchestration, retry, idempotency, SLA, monitoring, and backfill strategy. |
| `/quality` | Generate quality gates for code, API, data, testing, security, and release readiness. |
| `/task` | Split PRD or feature design into implementation tasks. |
| `/api` | Generate or validate API contract. |
| `/review` | Run enterprise code review against current git diff. |
| `/test` | Generate test plan and test cases from PRD, code, and diff. |
| `/diff` | Compare git diff with PRD, journey, API contract, and test plan. |
| `/release` | Generate release notes, go-live checklist, rollback plan, and risk assessment. |
| `/intake` | Run interactive project intake and generate missing-context questions. |
| `/context` | Capture user answers and update project background context. |
| `/datacontract` | Generate bank-grade data contract and compatibility rules. |
| `/sttm` | Generate Source-to-Target Mapping and transformation rules. |
| `/dq` | Generate executable data quality rules and SQL checks. |
| `/reconcile` | Generate reconciliation design, SQL checks, and exception handling. |
| `/lineage` | Generate table/field lineage analysis and Mermaid lineage graph. |
| `/sql-translate` | Translate SQL across Oracle, PostgreSQL, BigQuery, MaxCompute, Hive, etc. |
| `/migration` | Design data/schema migration, dual-run, validation, and rollback. |
| `/scheduler` | Design DAG scheduling, dependency, retry, SLA, and alerting strategy. |
| `/privacy` | Generate data privacy, masking, retention, and access-control assessment. |
| `/data-test` | Generate data testing strategy and executable test cases. |
| `/data-review` | Run bank-grade data engineering review for SQL/model/pipeline/release. |
| `/catalog` | Generate data catalog entry and business glossary. |
| `/semantic` | Generate semantic layer and agent-readable data card. |
| `/cost` | Generate database/cloud cost optimization plan. |
| `/runbook` | Generate production runbook, incident playbook, and backfill playbook. |

---

## 9. 工具命令使用规则

工具命令不会改变主流程，可以在任何阶段使用。

### 9.1 Prompt 优化

```text
@product-dev /prompt 优化这个 prompt：阅读 React 代码生成 PRD，并给出 Journey 和卡点
```

适合把粗糙想法变成可执行 prompt。

### 9.2 内容总结

```text
@product-dev /summarize 总结当前 PRD，输出给部门负责人看的 1 页版
```

适合周报、汇报、评审前压缩内容。

### 9.3 上下文压缩

```text
@product-dev /compress 将当前需求、代码背景、限制和未决问题压缩成 Codex / Claude Code 可执行上下文
```

适合把长上下文转移给其他 AI Agent。

### 9.4 文档 Review

```text
@product-dev /doc-review review 这份数据契约，按 Blocker / High / Medium / Low 给问题
```

适合评审 PRD、Prompt、SQL、方案、上线文档。

### 9.5 改写

```text
@product-dev /rewrite 将这段内容升级为银行管理层汇报风格
```

适合面向不同受众改写。

### 9.6 检查清单

```text
@product-dev /checklist 为 Spring Boot + PostgreSQL 功能上线生成检查清单
```

适合评审、上线、交接、回归测试。

---

## 10. 数据开发使用规则

银行数据开发命令必须遵守以下原则：

1. 任何数据表设计都必须明确业务定义、粒度、Owner、SLA、分区、主键/唯一键、敏感等级。
2. 任何 SQL 都必须说明主表、Join 关系、过滤条件、分区裁剪、聚合粒度和性能风险。
3. 任何 Pipeline 都必须说明 watermark、幂等键、重跑、回补、失败重试、告警和人工介入点。
4. 任何 DQ 输出都必须尽量给出可执行检查 SQL、阈值、失败等级、异常落表和修复建议。
5. 任何涉及金额、交易笔数、账户余额的数据交付都必须考虑对账。
6. 任何敏感字段都必须考虑脱敏、权限、审计和保留期。
7. 任何上线都必须有 release checklist、rollback plan、runbook。
8. 不清楚公司规则时，应先让用户补充 Policy Pack，而不是编造规则。

---

## 11. 产物输出目录规则

默认输出到 `docs/` 下。

常见目录：

```text
docs/product/
docs/prd/
docs/journey/
docs/frontend/
docs/backend/
docs/api/
docs/data/
docs/06-data/contracts/
docs/06-data/sttm/
docs/06-data/dq/
docs/06-data/reconciliation/
docs/06-data/lineage/
docs/06-data/pipeline/
docs/06-data/privacy/
docs/06-data/review/
docs/09-runbook/
docs/tools/
```

所有输出文件建议提交到 Git，作为交付证据和后续 AI 上下文。

---

## 12. 配置项

| 配置 | 默认值 | 说明 |
|---|---|---|
| `companyProductDev.outputRoot` | `docs` | Root folder for generated artifacts. |
| `companyProductDev.modelFamily` | `gpt-4o` | Preferred model family when request.model is unavailable. |
| `companyProductDev.writeArtifacts` | `True` | Whether to write generated artifacts to workspace files. |
| `companyProductDev.maxContextFiles` | `60` | Maximum source files included in repository context. |
| `companyProductDev.defaultBackendStack` | `springboot` | Default backend stack used when user request is ambiguous. |
| `companyProductDev.defaultDatabaseEngine` | `postgresql` | Default SQL/database engine used when the request is ambiguous. |
| `companyProductDev.generatedCodeMode` | `design-first` | Controls how aggressively commands generate implementation code. |
| `companyProductDev.ralphMaxIterations` | `6` | Maximum number of workflow iterations to run for /loop before requiring user review. |
| `companyProductDev.ralphAutoRun` | `False` | When true, /loop runs multiple iterations immediately. When false, it initializes the loop and runs one safe iteration. |
| `companyProductDev.workflowMode` | `ordered` | Controls whether each command gives strict next-step guidance or flexible options. |
| `companyProductDev.initScaffoldMode` | `guided` | Default scaffold mode used by /init when user does not specify a track. |
| `companyProductDev.defaultDataEngines` | `['postgresql', 'oracle', 'bigquery', 'maxcompute']` | Default database engines for generated data engineering folders and prompts. |

---

## 13. 项目结构说明

```text
src/
  extension.ts                  # VS Code 插件入口
  chat/
    participant.ts              # 注册 @product-dev Chat Participant
    command-router.ts           # slash command 路由
  commands/                     # 每个命令的入口
  context/                      # repo、git、workspace、config 上下文读取
  prompt/                       # Prompt Compiler、输出 Schema、上下文构建
  policies/                     # Policy Pack 初始化、加载、扫描
  scaffold/                     # /init 项目骨架生成器
  loop/                         # Ralph Loop 状态机
  workflow/                     # 命令顺序和下一步提示
  writers/                      # 产物写入 docs/
  governance/                   # 质量门禁、审计日志
  integrations/                 # Jira/Confluence/SonarQube 占位集成
  utils/                        # 文件、日志、文本工具

templates/                      # 输出模板
policies/                       # 内置默认规则
docs/                           # 项目说明与架构文档
tests/                          # 测试
```

---

## 14. 开发者扩展规则

### 14.1 新增一个命令需要改哪些地方

1. 在 `package.json` 的 `contributes.chatParticipants[0].commands` 中声明命令。
2. 在 `src/core/types.ts` 的 `ProductDevCommand` 中加入命令名。
3. 新建 `src/commands/<command>.command.ts`。
4. 在 `src/chat/command-router.ts` 中 import 并注册路由。
5. 在 `src/prompt/prompt-compiler.ts` 中补充 title、role、task、constraints、artifactPath。
6. 在 `src/prompt/output-schemas.ts` 中补充输出结构。
7. 在 `src/workflow/workflow.ts` 中补充下一步建议。
8. 如需模板，加入 `templates/`。
9. 如需本地规则，加入 `.product-dev/policy-packs/` 推荐文件或 `policies/` 默认规则。
10. 补充 README / docs / 测试。

### 14.2 命令设计原则

每个命令都应具备：

```text
明确输入
明确角色
明确上下文
明确限制
明确输出 Schema
明确产物路径
明确质量检查
明确 Next Command
```

---

## 15. 安全与合规注意事项

- 不要把真实客户数据、账号、密钥、token、证书提交到 repo。
- Policy Pack 可以保存规则，但不应保存敏感样本数据。
- 对生产数据开发，AI 输出必须经过人工 Review。
- 对监管相关要求，AI 只能辅助整理，最终以公司合规/法务/安全团队批准版本为准。
- 对自动循环任务，默认使用 guided mode，不建议在未审查上下文和权限的情况下开启长时间自动执行。

---

## 16. 常见问题

### Q1：为什么生成结果不符合我公司的 DQ 规则？

请先执行：

```text
@product-dev /policy-init
@product-dev /policy-intake
```

然后把你们公司的 DQ 规则写入：

```text
.product-dev/policy-packs/company/dq-rules.yaml
```

再执行：

```text
@product-dev /policy-scan
@product-dev /policy-review
@product-dev /dq
```

### Q2：如果我的部门和国家规则冲突怎么办？

默认优先级是：

```text
global < company < department < country < project < environment
```

也就是国家/地区监管规则优先于部门规则，生产环境规则优先于项目通用规则。

### Q3：是否可以只用工具命令，不走完整流程？

可以。`/prompt`、`/summarize`、`/compress`、`/doc-review`、`/rewrite`、`/checklist` 是独立工具命令。

### Q4：是否可以只做数据开发？

可以：

```text
@product-dev /init data
```

### Q5：为什么要把输出写入 `docs/`？

因为企业开发需要可追踪、可 Review、可版本化的交付物。只在聊天窗口回答，不适合进入正式研发流程。

---

## 17. 版本说明

- v0.1：基础 `@product-dev` 命令体系。
- v0.2：前端、后端、数据开发扩展。
- v0.3：增强 System Prompt 与 Ralph Loop。
- v0.4：工具命令 `/prompt`、`/summarize`、`/compress`、`/doc-review`、`/rewrite`、`/checklist`。
- v0.5：银行数据开发 Pack 与交互式 `/init`。
- v0.6：Policy Pack Overlay，本地规则覆盖机制。
- v0.7：补齐 README、使用规则、开发者文档、源码讲解注释。


---

## 14. v0.9 新增：所有命令的用户输入优化

从 v0.9 开始，所有主要 AI 产物命令都会先经过 `UserInputOptimizer`，再进入 Prompt Compiler。它不会替用户编造需求，而是把原始输入整理成稳定的执行 brief：

1. 原始输入
2. 规范化目标
3. 识别出的意图
4. 任务范围
5. 必须保留的约束
6. 需要读取的上下文
7. 缺失问题
8. 期望输出结构
9. 质量检查点
10. 推荐使用的 Skill

这意味着下面这些命令都会自动获得更强的 prompt 质量：

```text
@product-dev /frontend ...
@product-dev /springboot ...
@product-dev /python ...
@product-dev /data ...
@product-dev /sql ...
@product-dev /dq ...
@product-dev /review ...
@product-dev /release ...
```

标准优化思路是：

```text
Raw User Input
→ Intent Detection
→ Goal Normalization
→ Scope Extraction
→ Constraint Preservation
→ Missing Context Questions
→ Output Schema Binding
→ Quality Gate Injection
→ Skill Matching
→ Final Prompt Package
```

## 15. v0.9 新增：用户自定义 Skill

每个团队可以在仓库中添加自己的 Skill，用来增强命令能力。Skill 适合承载：

- 部门级 Review 方法
- 银行数据开发专项检查
- 前端组件设计规范
- Java Spring Boot 分层规范
- Python/FastAPI 工程规范
- SQL 优化规则
- DQ / 对账 / 血缘专项能力
- 公司内部 Prompt 模板

### 15.1 初始化 Skill 目录

```text
@product-dev /skill-init
```

会生成：

```text
.product-dev/skills/
├── README.md
├── prompt-quality/
│   └── SKILL.md
├── bank-data-engineering/
│   └── SKILL.md
├── frontend-review/
│   └── SKILL.md
├── springboot-engineering/
│   └── SKILL.md
└── python-engineering/
    └── SKILL.md
```

### 15.2 Skill 文件格式

```md
---
name: bank-data-engineering
description: Bank-grade data engineering guardrails
appliesTo: data,sql,dq,reconcile,lineage,data-review
triggers: dq,sttm,reconciliation,lineage,bank data
---

# Bank Data Engineering Skill

Always check data contract, STTM, DQ, reconciliation, lineage, privacy, scheduler, cost, and runbook readiness.
```

### 15.3 扫描 Skill

```text
@product-dev /skill-scan
```

### 15.4 直接运行 Skill

```text
@product-dev /skill-run bank-data-engineering review this PostgreSQL SQL and DQ design
```

### 15.5 Review Skill 质量

```text
@product-dev /skill-review
```

### 15.6 Skill 自动生效规则

普通命令会自动匹配 Skill：

- 命令命中 `appliesTo`
- 用户输入命中 `triggers`
- `UserInputOptimizer` 推荐了该 Skill

例如：

```text
@product-dev /dq 为交易明细表生成数据质量规则
```

会自动加载：

```text
.product-dev/skills/prompt-quality/SKILL.md
.product-dev/skills/bank-data-engineering/SKILL.md
```

## 16. Skill 与 Policy Pack 的区别

| 类型 | 用途 | 示例 | 优先级 |
|---|---|---|---|
| Policy Pack | 规定必须遵守的公司/部门/国家/项目/环境规则 | DQ 阈值、发布门禁、隐私规则 | 高 |
| Skill | 增强模型执行能力和方法论 | SQL Review 方法、Prompt 优化套路、Spring Boot 分层检查 | 中 |
| User Prompt | 当前任务目标 | 生成某功能、Review 某 SQL | 任务输入 |

当 Skill 和 Policy Pack 冲突时，以 Policy Pack 为准。

## 17. 推荐 v0.9 使用顺序

```text
@product-dev /init fullstack react springboot postgresql copilot opencode
@product-dev /skill-init
@product-dev /skill-scan
@product-dev /policy-intake
@product-dev /policy-scan
@product-dev /intake
@product-dev /context <补充项目背景>
@product-dev /plan
```

之后进入具体研发流程。

---

# v1.0 OpenCode-compatible Prompt/Skill Resources and SQL Tooling

This version adds a tool-neutral resource structure so prompts and skills are not locked inside VS Code Copilot extension code.

## Portable prompt and skill layout

```text
agent-resources/
├── prompts/
│   ├── system/
│   ├── commands/
│   └── output-schemas/
└── skills/
```

Project-specific overrides live in:

```text
.product-dev/prompts/
.product-dev/skills/
.product-dev/policy-packs/
```

## New commands

```text
@product-dev /resources-init
@product-dev /resources-scan
@product-dev /nl2sql
@product-dev /sql-translate
@product-dev /sql-review
```

## SQL support

The SQL toolchain supports PostgreSQL, Oracle, BigQuery, MaxCompute/ODPS, MySQL, SQL Server, Snowflake, Databricks/Spark SQL, and Hive.

Use `/nl2sql` for natural-language-to-SQL, `/sql-translate` for cross-dialect conversion, and `/sql-review` for production SQL review.

## OpenCode migration

OpenCode-compatible files are generated under:

```text
AGENTS.md
.opencode/agents/
.opencode/commands/
```

These should reference `agent-resources/` rather than duplicating prompt logic.



## v1.1.0 Anthropic-Style Skills

This version upgrades the prompt/skill system to follow the Agent Skills pattern used by Anthropic-style skills:

```text
<skill-name>/
├── SKILL.md
├── references/
├── scripts/
├── examples/
└── evals/
```

### Rules

- `SKILL.md` must start with YAML frontmatter containing `name` and `description`.
- `description` is the discovery and triggering contract. Write it as “Use this skill when...” rather than as a short label.
- Keep `SKILL.md` concise. Move long SQL dialect matrices, bank data checklists, examples, and rubrics into `references/`.
- Put deterministic helper code in `scripts/` only when it is safe, auditable, and clearly documented.
- Put realistic test prompts in `evals/evals.json`.
- Mandatory company, department, country, project, and environment rules still belong in `.product-dev/policy-packs/`, not inside skills.

### New or improved skill assets

```text
agent-resources/skills/
├── skill-creator/
├── prompt-quality/
├── bank-data-engineering/
├── sql-engineering/
├── nl2sql/
├── sql-review/
├── sql-translate/
├── frontend-review/
├── springboot-engineering/
└── python-engineering/
```

### Skill commands

```text
@product-dev /skill-init
@product-dev /skill-scan
@product-dev /skill-review
@product-dev /skill-run sql-review review this SQL
```

`/skill-scan` now shows resource counts and quality warnings. `/skill-review` now checks triggering reliability, progressive disclosure, eval coverage, and security boundaries.

### Prompt and skill precedence

```text
Policy Pack
> Project Prompt Override
> Project Skill
> Portable Agent Resource
> Extension Built-in Default
```


---

## DESIGN.md UI Design Workflow

This version adds a frontend design-system workflow compatible with Google Stitch-style `DESIGN.md`, Copilot, and OpenCode.

### New commands

```text
@product-dev /design-md
@product-dev /ui-design
```

`/design-md` reads the current frontend project and generates a root-level `DESIGN.md`. It scans routes, pages, components, CSS/SCSS/Less files, Tailwind config, theme/token files, package dependencies, and existing UI docs. It also writes a reviewable copy to `docs/frontend/DESIGN.md`.

`/ui-design` uses existing `DESIGN.md` or user-provided design direction to create implementation-ready UI design guidance for pages/components.

### Portable resources

```text
agent-resources/prompts/commands/design-md.md
agent-resources/prompts/output-schemas/design-md.md
agent-resources/skills/design-md/SKILL.md
.github/prompts/design-md.prompt.md
.opencode/commands/design-md.md
.opencode/agents/design-system-engineer.md
```

See `docs/DESIGN_MD_UI_WORKFLOW.md` for the full workflow.

---

## v1.3 Prompt Optimizer and Attachment Context

Every model-backed command now runs through a deterministic prompt optimizer before the final domain prompt is compiled. The optimizer follows the same core ideas as Copilot Prompt Optimizer: intent recognition, context awareness, structured prompt sections, multi-version outputs, and history-friendly normalized prompts.

The pipeline is:

```text
raw user input
→ active editor / selected code / surrounding code
→ Chat attachments / file references
→ intent recognition
→ normalized goal
→ scope / constraints / missing questions
→ output schema binding
→ skill matching
→ final command prompt
```

### Attachment Context

Use this before running a complex command:

```text
@product-dev /attachments
```

Then attach PRDs, SQL files, schema DDL, DESIGN.md, frontend components, data contracts, or policy files and run:

```text
@product-dev /nl2sql 基于附件中的DDL生成查询最近30天客户交易金额的BigQuery SQL
@product-dev /sql-review review附件中的SQL，检查join放大、分区裁剪、DQ、对账和隐私风险
@product-dev /design-md 读取附件中的React组件和theme文件，整理项目DESIGN.md
```

Binary attachments are summarized but not injected. For best results, attach text-based exports such as `.md`, `.sql`, `.json`, `.yaml`, `.csv`, `.ts`, `.tsx`, `.java`, `.py`, or `.xml`.

### Portable Optimizer Assets

The optimizer is not locked into VS Code. Its reusable prompt and skill files live in:

```text
agent-resources/prompts/commands/prompt-input-optimizer.md
agent-resources/prompts/output-schemas/prompt-input-optimizer.md
agent-resources/skills/prompt-input-optimizer/SKILL.md
.opencode/commands/prompt-input-optimizer.md
.github/prompts/prompt-input-optimizer.prompt.md
```

This makes it easier to migrate the same prompt/skill behavior to OpenCode later.


## Karpathy-guided skills

v1.5.0 adds `karpathy-guidelines`, inspired by `forrestchang/andrej-karpathy-skills`, as a cross-cutting behavior skill. It applies to all non-trivial engineering commands and reinforces four rules: think before acting, simplicity first, surgical changes, and goal-driven verification. See `docs/KARPATHY_SKILL_OPTIMIZATION.md`.

---

## v1.6 VS Code Copilot Subagent Support

VS Code Copilot supports subagents through custom agents and the built-in `agent` / `runSubagent` tool when that tool is enabled for the current custom agent. This project now generates workspace custom agents under `.github/agents/` and injects subagent delegation guidance into complex `@product-dev` commands.

New commands:

```text
@product-dev /agents-init
@product-dev /agents-scan
```

Recommended setup:

```text
@product-dev /agents-init
@product-dev /agents-scan
```

Then open VS Code Copilot Chat, select the workspace custom agent named `product-dev-coordinator`, and ask it to handle a complex task. The coordinator is configured with the `agent` tool and a restricted worker list:

```text
prd-planner
design-system-engineer
frontend-engineer
springboot-engineer
python-engineer
sql-engineer
bank-data-engineer
quality-reviewer
security-reviewer
release-manager
```

For normal `@product-dev` commands, the extension now decides whether a task is complex enough to recommend subagents. If yes, the compiled prompt includes a `Subagent Delegation Guidance` section. If native VS Code subagents are available, the coordinator can run the workers. If not, the same section becomes a manual delegation plan.

See `docs/VS_CODE_COPILOT_SUBAGENTS.md` for the full design.


## Diagram Workflow v1.7

New commands:

- `@product-dev /architecture-diagram` — generates system context, container/component, deployment, sequence, data-flow, security/trust-boundary, and observability diagrams.
- `@product-dev /journey-diagram` — generates user journey, user flow, state transition, funnel/friction, and instrumentation diagrams.
- `@product-dev /diagram` — generates the minimum useful diagram pack for the current SDLC step.

All major product, frontend, backend, API, data, quality, release, and runbook artifacts now include a `Required Diagrams` section when visual documentation is useful. Mermaid is the default format so diagrams are portable to GitHub, VS Code, OpenCode, and documentation sites.


## Code Graph Intelligence Commands

Inspired by GitNexus-style repository knowledge graphs, this project now includes:

- `@product-dev /code-graph` — map modules, dependencies, clusters, entry points, execution flows, and risk hotspots.
- `@product-dev /impact-analysis` — analyze blast radius for current git diff or a requested change.
- `@product-dev /code-wiki` — generate a durable code wiki that helps Copilot/OpenCode agents understand the repo.

These commands work with the built-in repo scanner. If your team runs GitNexus CLI/MCP, attach/export GitNexus output or use MCP-enabled agents for deeper symbol/process graph evidence.
