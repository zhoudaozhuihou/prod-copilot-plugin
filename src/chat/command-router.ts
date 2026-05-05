import { CommandArgs } from '../core/types';
import { runAiArtifactCommand, runLocalInfoCommand, streamResult } from '../commands/shared';
import { renderToolCommandTable, renderWorkflowTable } from '../workflow/workflow';
import { getInternalCommand, recordCommandUsage } from './command-registry';

const LOCAL_COMMANDS = new Set(['attachments', 'backend-api-scan']);

export function normalizeCommand(command?: string): string {
  const raw = (command || 'help').trim().replace(/^\//, '') || 'help';
  return getInternalCommand(raw);
}

export async function routeCommand(args: CommandArgs, exposedCommand: string): Promise<void> {
  // Record usage stats
  recordCommandUsage(args.extensionContext, exposedCommand);

  if (args.command === 'help') {
    args.stream.markdown(renderHelp());
    return;
  }

  if (LOCAL_COMMANDS.has(args.command)) {
    await runLocalInfoCommand(args, args.command);
    return;
  }

  const result = await runAiArtifactCommand(args, args.command);
  streamResult(args, result);
}

function renderHelp(): string {
  return `# @product-dev 命令帮助系统

系统已按照功能模块进行分类，帮助您快速定位命令。

## 🗺️ 可视化命令分类树

\`\`\`text
@product-dev
├── 核心功能 (直接使用)
│   ├── /init        - 项目初始化与脚手架
│   ├── /plan        - 任务规划与路径推荐
│   ├── /scan        - 扫描当前代码库与架构
│   ├── /prompt      - 优化提示词
│   ├── /summarize   - 总结上下文
│   └── /compress    - 压缩上下文历史
│
├── 🛠️ 开发功能 (/dev-*)
│   ├── /dev-frontend   - 前端组件与页面设计
│   ├── /dev-backend    - 后端接口与架构设计
│   ├── /dev-springboot - Spring Boot 专属开发
│   ├── /dev-python     - Python 专属开发
│   ├── /dev-data       - 数据平台工程开发
│   ├── /dev-sql        - 核心 SQL 逻辑开发
│   ├── /dev-dbschema   - 数据库 Schema 设计
│   └── /dev-api        - API 契约生成
│
├── 🧪 测试功能 (/test-*)
│   ├── /test-plan            - 测试计划与用例生成
│   ├── /test-api-gen         - 基于代码的 API 测试生成
│   ├── /test-springboot-api  - Spring Boot 测试代码
│   ├── /test-python-api      - Python 测试代码
│   └── /test-data            - 数据流水线测试
│
└── 🐞 调试与审查 (/debug-*)
    ├── /debug-review   - 企业级代码审查
    ├── /debug-impact   - 变更影响面分析
    ├── /debug-doc      - 文档与设计评审
    ├── /debug-sql      - SQL 风险与性能审查
    └── /debug-data     - 数据资产审计与对账
\`\`\`

## 💡 最佳实践指南
1. **模糊搜索与自动识别**: 即使您忘记了确切的命令，只要输入带有特定意图的话语（例如："帮我测试后端代码"），系统将自动映射到对应的 \`/test-api-gen\` 命令。
2. **智能推荐**: 在每次执行完指令后，系统会根据您的上下文和使用习惯（动态统计高频命令），在聊天框下方提供 3-5 个**一键执行**的建议后续动作。
3. **工作流连贯性**: 遵循 \`计划 (plan) -> 开发 (dev-*) -> 测试 (test-*) -> 审查 (debug-*)\` 的标准流水线可大幅提高交付质量。
`;
}
