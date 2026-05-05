# 企业级开发规范集成方案 (Enterprise Development Standards Integration Plan)

## 1. 规范基线分析与检查点识别

基于当前项目的策略文件（`policies/*.yaml`），识别出以下关键基线要求：
*   **编码标准 (`coding-standard.yaml`)**: 文件长度 < 1000 行，函数长度 < 200 行，圈复杂度 (Cyclomatic Complexity) < 15。必须包含异常处理和关键流日志。
*   **安全门禁 (`security-standard.yaml`)**: 严禁硬编码敏感信息，禁止日志打印 Token，强制要求认证授权及审计日志。
*   **分支与提交**: 需符合 Conventional Commits 标准，确保生成 Changelog 及版本追溯。
*   **测试与覆盖率**: 业务逻辑变更必须附带单元测试（`requireTestsForChangedLogic`）。
*   **文档规范**: PRD、架构图、数据契约等须遵循项目内的标准 Markdown / Mermaid 结构。

## 2. 自动化接入技术方案

### 2.1 本地防线 (Local Git Hooks)
*   **工具**: 使用 `Husky` + `lint-staged` + `commitlint`。
*   **行为**: 
    *   拦截不符合 Conventional Commits 的提交（如 `git commit -m "fix bug"` 将被拒绝，要求 `fix(auth): handle null token exception`）。
    *   提交前自动运行 ESLint / Prettier 格式化，并执行增量测试 (`vitest related`)。

### 2.2 质量门禁 (CI/CD Pipeline)
*   **工具**: GitHub Actions / GitLab CI / Jenkins。
*   **行为**:
    *   **代码扫描 (SAST)**: 集成 SonarQube 或 CodeQL 扫描 `security-standard.yaml` 中的漏洞。
    *   **测试覆盖率**: 使用 Istanbul / JaCoCo，强制卡点 PR 合并（例如增量覆盖率必须 >= 80%）。
    *   **架构合规卡点**: 使用 `company-product-dev-copilot` 提供的 `@product-dev /debug-review` 对 PR 进行自动化 AI Code Review。

## 3. 规范落地实施计划

| 阶段 | 里程碑 | 交付物 | 验收标准 | 责任人 |
| :--- | :--- | :--- | :--- | :--- |
| **阶段一：基线对齐** (第1-2周) | 统一本地工具链配置 | `.husky`, `eslint.config.js`, `commitlint.config.js` 配置文件库 | 核心团队可正常 clone 并触发提交拦截 | DevOps / Tech Lead |
| **阶段二：CI/CD 融合** (第3-4周) | 完成持续集成流水线改造 | `ci.yml` / `pr-review.yml` 等流水线文件 | PR 创建后自动触发测试、覆盖率统计及 AI 审查卡点 | DevOps / Tech Lead |
| **阶段三：AI Copilot 赋能** (第5周) | 植入智能体评审流程 | `dev-standards-enforcer` Skill 文件 | 开发者可通过 Copilot 预检代码合规性 | AI Engineer / Architect |
| **阶段四：试运行与宣贯** (第6周) | 规范宣发与试运行收集反馈 | 《开发者使用手册》, 内部培训录屏 | 团队完全掌握自动化工具链的错误修复路径 | Tech Lead / PM |

## 4. 规范执行的监控机制
*   **违规预警**: CI 流水线失败将自动发送消息至企业 IM（如钉钉、飞书、Slack、Teams）对应的研发群，附带失败报告。
*   **度量指标 (Metrics)**: 收集并建立仪表盘：
    *   PR 自动化测试通过率。
    *   平均圈复杂度走势。
    *   AI 拦截出的高危安全漏洞数。
*   **定期审计**: 每月月末由架构委员会（Architecture Board）回顾代码质量报告，对屡次触发拦截的模块进行重构排期。

## 5. 持续改进机制
*   **反馈循环**: 在内部建立 `Architecture/Standards` 专用的 Issue 板块，允许开发者对“过于严格或不合理的规范”提出 Challenge。
*   **动态阈值**: 根据团队成熟度动态调整 `coding-standard.yaml`，例如从初始的“函数最多200行”逐步收紧至“函数最多100行”。
