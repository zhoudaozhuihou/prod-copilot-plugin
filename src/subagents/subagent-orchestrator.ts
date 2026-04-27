/**
 * VS Code Copilot subagent support.
 *
 * VS Code's native subagent mechanism is driven by custom agents and the built-in
 * `agent` / `runSubagent` tool. An extension ChatParticipant cannot safely force
 * a subagent invocation by itself; instead, this project creates workspace custom
 * agents under `.github/agents/` and injects delegation guidance into every complex
 * model-backed command. When the user runs the generated coordinator agent in
 * Copilot Chat, VS Code can use these custom agents as subagents.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ensureDir, exists } from '../utils/fs-utils';
import { ProductDevCommand, RepoContext } from '../core/types';
import { OptimizedUserInput } from '../prompt/user-input-optimizer';

export interface SubagentFileSpec {
  file: string;
  name: string;
  description: string;
  content: string;
}

export interface SubagentInitResult {
  createdDirectories: string[];
  createdFiles: string[];
  agentFiles: string[];
}

export interface SubagentScanResult {
  root: string;
  agentFiles: string[];
  warnings: string[];
  markdown: string;
}

const CORE_SUBAGENTS = [
  'prd-planner',
  'design-system-engineer',
  'diagram-architect',
  'frontend-engineer',
  'springboot-engineer',
  'python-engineer',
  'sql-engineer',
  'bank-data-engineer',
  'quality-reviewer',
  'security-reviewer',
  'release-manager'
];

const COMPLEX_COMMANDS = new Set<ProductDevCommand>([
  'plan', 'prd', 'story-split', 'ralph-readiness', 'frontend', 'backend', 'springboot', 'python', 'data',
  'datacontract', 'sttm', 'dq', 'reconcile', 'lineage', 'pipeline', 'scheduler', 'privacy', 'data-test',
  'data-review', 'nl2sql', 'sql-review', 'sql-translate', 'design-md', 'ui-design', 'architecture-diagram', 'journey-diagram', 'diagram', 'review', 'quality',
  'test', 'release', 'diff', 'loop', 'loop-next'
]);

const PARALLEL_REVIEW_COMMANDS = new Set<ProductDevCommand>([
  'review', 'data-review', 'sql-review', 'quality', 'release', 'ralph-readiness'
]);

/**
 * Create VS Code custom agents and prompt shims used by Copilot subagents.
 * The files are idempotent and safe to commit.
 */
export async function initializeSubagentAssets(root: string): Promise<SubagentInitResult> {
  const createdDirectories: string[] = [];
  const createdFiles: string[] = [];

  async function mkdir(relativePath: string): Promise<void> {
    await ensureDir(path.join(root, relativePath));
    createdDirectories.push(relativePath);
  }

  async function writeIfMissing(relativePath: string, content: string): Promise<void> {
    const absolute = path.join(root, relativePath);
    await ensureDir(path.dirname(absolute));
    if (!(await exists(absolute))) {
      await fs.writeFile(absolute, content, 'utf8');
      createdFiles.push(relativePath);
    }
  }

  await mkdir('.github/agents');
  await mkdir('.github/prompts');
  await mkdir('agent-resources/prompts/commands');
  await mkdir('agent-resources/skills/subagent-orchestration/references');
  await mkdir('agent-resources/skills/subagent-orchestration/evals');
  await mkdir('.opencode/commands');

  const agentFiles = buildVsCodeAgentFiles();
  for (const spec of agentFiles) {
    await writeIfMissing(spec.file, spec.content);
  }

  await writeIfMissing('agent-resources/prompts/commands/subagent-orchestration.md', buildSubagentPromptResource());
  await writeIfMissing('agent-resources/skills/subagent-orchestration/SKILL.md', buildSubagentSkill());
  await writeIfMissing('agent-resources/skills/subagent-orchestration/references/delegation-matrix.md', buildDelegationMatrix());
  await writeIfMissing('agent-resources/skills/subagent-orchestration/evals/evals.json', JSON.stringify({
    cases: [
      {
        name: 'Complex review uses independent reviewers',
        input: '@product-dev /review review a Spring Boot + PostgreSQL change',
        expected: ['quality-reviewer', 'security-reviewer', 'springboot-engineer']
      },
      {
        name: 'Data pipeline uses data and SQL reviewers',
        input: '@product-dev /data-review review MaxCompute pipeline DQ and reconciliation',
        expected: ['bank-data-engineer', 'sql-engineer', 'quality-reviewer']
      }
    ]
  }, null, 2));
  await writeIfMissing('.github/prompts/subagent-orchestration.prompt.md', buildGithubSubagentPrompt());
  await writeIfMissing('.opencode/commands/subagent-plan.md', buildOpenCodeSubagentCommand());

  return { createdDirectories, createdFiles, agentFiles: agentFiles.map(a => a.file) };
}

/** Scan .github/agents for VS Code custom agent readiness. */
export async function scanSubagentAssets(root: string): Promise<SubagentScanResult> {
  const agentRoot = path.join(root, '.github', 'agents');
  const warnings: string[] = [];
  let agentFiles: string[] = [];

  if (!(await exists(agentRoot))) {
    warnings.push('Missing .github/agents/. Run @product-dev /agents-init or @product-dev /init ... copilot.');
  } else {
    const entries = await fs.readdir(agentRoot);
    agentFiles = entries.filter((e: string) => e.endsWith('.agent.md') || e.endsWith('.md')).map((e: string) => `.github/agents/${e}`).sort();
  }

  const missing = CORE_SUBAGENTS.filter(name => !agentFiles.some(file => file.includes(name)));
  if (!agentFiles.some(file => file.includes('product-dev-coordinator'))) {
    warnings.push('Missing product-dev-coordinator agent. The coordinator is required for reliable subagent orchestration.');
  }
  if (missing.length) {
    warnings.push(`Missing recommended worker agents: ${missing.join(', ')}.`);
  }

  const markdown = `# VS Code Copilot Subagent Scan\n\n## Agent root\n\n\`${path.relative(root, agentRoot) || '.github/agents'}\`\n\n## Detected agents\n\n${agentFiles.length ? agentFiles.map(f => `- \`${f}\``).join('\n') : '- None'}\n\n## Warnings\n\n${warnings.length ? warnings.map(w => `- ${w}`).join('\n') : '- No blocking warnings detected.'}\n\n## How to use\n\n1. Run \`@product-dev /agents-init\` if files are missing.\n2. In VS Code Copilot Chat, select the workspace custom agent named \`product-dev-coordinator\`.\n3. Ask for a complex task. The coordinator has the \`agent\` tool and a restricted \`agents\` list, so it can delegate focused work to specialized subagents.\n\n## Important limitation\n\nThe \`@product-dev\` ChatParticipant can create subagent-ready assets and inject delegation plans, but native subagent execution happens inside VS Code Copilot custom agents via the \`agent\` / \`runSubagent\` tool.\n`;

  return { root: agentRoot, agentFiles, warnings, markdown };
}

/**
 * Generate command-specific subagent guidance that is injected into all complex command prompts.
 * This does not claim that the extension itself already executed subagents; it gives Copilot the
 * correct delegation contract when native subagents are available.
 */
export function renderSubagentGuidance(command: ProductDevCommand, optimized: OptimizedUserInput, repo?: RepoContext): string {
  if (!shouldSuggestSubagents(command, optimized, repo)) return '';
  const workers = selectSubagents(command, optimized, repo);
  const mode = PARALLEL_REVIEW_COMMANDS.has(command) ? 'parallel independent review' : 'coordinator-worker delegation';
  return [
    '# Subagent Delegation Guidance',
    `Mode: ${mode}`,
    '',
    'VS Code Copilot supports native subagents through custom agents and the `agent` / `runSubagent` tool. If the current chat session has subagent support enabled, use isolated subagents for the subtasks below; otherwise, include this section as an explicit manual delegation plan.',
    '',
    '## When to delegate',
    '- The task spans more than one discipline, such as PRD + frontend + backend + data + review.',
    '- Independent review perspectives would reduce anchoring bias.',
    '- Repository exploration or design research would pollute the main context.',
    '- The command is review-heavy, migration-heavy, or needs SQL/data/security specialization.',
    '',
    '## Recommended subagents',
    ...workers.map(worker => `- ${worker.name}: ${worker.task}`),
    '',
    '## Return contract for each subagent',
    '- Findings only; do not return long scratch work.',
    '- Evidence: files, symbols, SQL snippets, policy files, or assumptions used.',
    '- Severity or decision: Blocker/High/Medium/Low or Approved/Changes Required.',
    '- Required actions and validation checks.',
    '',
    '## Synthesis rule',
    'The main agent must merge subagent outputs into one prioritized artifact and explicitly mark disagreements, assumptions, and unresolved questions.'
  ].join('\n');
}

export function shouldSuggestSubagents(command: ProductDevCommand, optimized: OptimizedUserInput, repo?: RepoContext): boolean {
  if (!COMPLEX_COMMANDS.has(command)) return false;
  const signalCount = [
    optimized.scope.length > 5,
    optimized.suggestedSkills.length > 2,
    optimized.attachmentSignals.length > 0,
    (repo?.sourceFiles.length ?? 0) > 20,
    /complex|复杂|fullstack|全栈|migration|迁移|review|评审|安全|security|data|sql|release|上线/i.test(optimized.originalPrompt)
  ].filter(Boolean).length;
  return signalCount >= 2 || PARALLEL_REVIEW_COMMANDS.has(command);
}

function selectSubagents(command: ProductDevCommand, optimized: OptimizedUserInput, repo?: RepoContext): Array<{ name: string; task: string }> {
  const text = `${command} ${optimized.originalPrompt} ${repo?.techStack.join(' ') ?? ''}`.toLowerCase();
  const workers = new Map<string, string>();

  if (['prd', 'story-split', 'prd-json', 'plan', 'feature'].includes(command)) {
    workers.set('prd-planner', 'Clarify scope, split stories, define acceptance criteria, and identify dependencies.');
  }
  if (/(design\.md|ui|frontend|react|vue|angular)/i.test(text) || ['design-md', 'ui-design', 'frontend', 'journey'].includes(command)) {
    workers.set('design-system-engineer', 'Analyze UI system, DESIGN.md, components, accessibility, and visual consistency.');
    workers.set('frontend-engineer', 'Validate frontend implementation path, component boundaries, state, API hooks, and tests.');
  }
  if (/(diagram|mermaid|architecture|journey|架构图|旅程图|流程图)/i.test(text) || ['architecture-diagram', 'journey-diagram', 'diagram'].includes(command)) {
    workers.set('diagram-architect', 'Generate or review Mermaid diagram-as-code, select appropriate diagram types, and validate evidence, assumptions, and maintenance triggers.');
  }
  if (/(spring|java)/i.test(text) || command === 'springboot') {
    workers.set('springboot-engineer', 'Validate Spring Boot layering, API contract, transactions, validation, security, and tests.');
  }
  if (/(python|fastapi|flask)/i.test(text) || command === 'python') {
    workers.set('python-engineer', 'Validate Python backend structure, schemas, services, repositories, async/runtime behavior, and tests.');
  }
  if (/(sql|postgres|oracle|bigquery|maxcompute|odps|hive|snowflake|databricks)/i.test(text) || ['sql', 'nl2sql', 'sql-review', 'sql-translate'].includes(command)) {
    workers.set('sql-engineer', 'Review SQL semantics, dialect, join/grain safety, validation SQL, and performance/cost risk.');
  }
  if (/(data|dq|reconcile|lineage|sttm|contract|privacy|scheduler|runbook)/i.test(text) || ['data', 'datacontract', 'sttm', 'dq', 'reconcile', 'lineage', 'pipeline', 'scheduler', 'data-review'].includes(command)) {
    workers.set('bank-data-engineer', 'Review data contract, STTM, DQ, reconciliation, lineage, privacy, scheduling, and runbook readiness.');
  }
  if (PARALLEL_REVIEW_COMMANDS.has(command) || /review|评审|quality|门禁/i.test(text)) {
    workers.set('quality-reviewer', 'Review correctness, maintainability, tests, quality gates, release blockers, and Definition of Done.');
    workers.set('security-reviewer', 'Review security, privacy, permissions, injection risks, sensitive data exposure, and auditability.');
  }
  if (['release', 'ralph-readiness', 'loop', 'loop-next'].includes(command) || /release|上线|部署|runbook/i.test(text)) {
    workers.set('release-manager', 'Review release readiness, rollback, runbook, monitoring, SLA, and approval evidence.');
  }

  if (workers.size === 0) {
    workers.set('quality-reviewer', 'Perform a focused independent review and return risks, assumptions, and validation checks.');
  }
  return Array.from(workers.entries()).map(([name, task]) => ({ name, task }));
}

function buildVsCodeAgentFiles(): SubagentFileSpec[] {
  return [
    agent('product-dev-coordinator', 'Coordinate complex product, frontend, backend, and bank-data engineering work. Use subagents when isolated research, parallel review, or specialized validation improves quality.', ['agent', 'read', 'search', 'edit'], CORE_SUBAGENTS, false, `You are the Product Dev Coordinator.\n\nUse subagents for complex tasks rather than doing all work in one context. Delegate only focused subtasks and request concise return contracts: evidence, findings, risks, required fixes, and validation checks.\n\nDefault flow:\n1. Clarify assumptions and non-goals.\n2. Decide whether subagents are useful.\n3. Delegate to only the minimum necessary workers.\n4. Synthesize results into one actionable artifact.\n5. End with the next @product-dev command or the next custom agent handoff.\n\nNever delegate policy decisions that require human approval. Never ask subagents to modify unrelated code.`),
    agent('prd-planner', 'Subagent for PRD, feature decomposition, Ralph-sized story splitting, acceptance criteria, and dependency ordering.', ['read', 'search'], [], true, 'Create small, verifiable PRD/story outputs. Ask 3-5 targeted questions when context is missing. Prefer one-story-per-iteration Ralph sizing.'),
    agent('design-system-engineer', 'Subagent for DESIGN.md extraction/generation, UI design system analysis, accessibility, visual tokens, and frontend design consistency.', ['read', 'search'], [], true, 'Analyze existing UI evidence before making design claims. Separate evidence from assumptions. Follow Stitch-compatible DESIGN.md structure.'),
    agent('diagram-architect', 'Subagent for Mermaid diagram-as-code covering architecture, user journey, API sequence, data lineage, pipeline, DQ, reconciliation, release, rollback, and incident flows.', ['read', 'search'], [], true, 'Generate concise, evidence-backed Mermaid diagrams. Select the minimum useful diagram set, state assumptions, add interpretation notes, and define update triggers.'),
    agent('frontend-engineer', 'Subagent for frontend implementation planning, React/Vue/Angular components, state, API hooks, UX states, accessibility, and tests.', ['read', 'search'], [], true, 'Validate frontend architecture, component boundaries, state flow, accessibility, testability, and performance. Keep recommendations stack-specific.'),
    agent('springboot-engineer', 'Subagent for Java Spring Boot implementation planning, API contracts, validation, transactions, security, observability, and tests.', ['read', 'search'], [], true, 'Review Spring Boot layering, DTO validation, service boundaries, transaction safety, security, OpenAPI, observability, and tests.'),
    agent('python-engineer', 'Subagent for Python FastAPI/Flask implementation planning, Pydantic models, service/repository layers, database access, runtime behavior, and pytest.', ['read', 'search'], [], true, 'Review Python backend structure, schemas, services, repositories, error handling, async/runtime behavior, migration, and pytest coverage.'),
    agent('sql-engineer', 'Subagent for NL2SQL, SQL dialect translation, SQL review, join/grain safety, validation SQL, and SQL performance across PostgreSQL, Oracle, BigQuery, MaxCompute, Hive, Snowflake, and Databricks.', ['read', 'search'], [], true, 'Review SQL with dialect awareness. Always check grain, join cardinality, null semantics, partition pruning, validation SQL, DQ/reconciliation, privacy, and cost.'),
    agent('bank-data-engineer', 'Subagent for bank-grade data contract, STTM, DQ, reconciliation, lineage, scheduler, privacy, migration, cost, and runbook review.', ['read', 'search'], [], true, 'Apply bank data engineering rigor: contract, STTM, DQ, reconciliation, lineage, privacy, scheduler, backfill, runbook, and operational readiness.'),
    agent('quality-reviewer', 'Subagent for correctness, maintainability, testability, quality gates, release blockers, and Definition of Done.', ['read', 'search'], [], true, 'Review for correctness, maintainability, testability, missing acceptance criteria, incomplete evidence, and release-blocking gaps. Use Blocker/High/Medium/Low.'),
    agent('security-reviewer', 'Subagent for security, privacy, permission, injection, sensitive data exposure, auditability, and policy compliance review.', ['read', 'search'], [], true, 'Review security and privacy risks. Check least privilege, sensitive fields, masking, injection risks, secrets, audit logging, and policy pack constraints.'),
    agent('release-manager', 'Subagent for release readiness, rollback, runbook, monitoring, SLA, approvals, incident playbook, and go-live evidence.', ['read', 'search'], [], true, 'Review release readiness. Require rollback, runbook, monitoring, SLA, validation evidence, approvals, and incident handling plan.')
  ];
}

function agent(name: string, description: string, tools: string[], agents: string[], hidden: boolean, body: string): SubagentFileSpec {
  const frontmatter = [
    '---',
    `name: ${name}`,
    `description: ${JSON.stringify(description)}`,
    `tools: [${tools.map(t => `'${t}'`).join(', ')}]`,
    agents.length ? `agents: [${agents.map(a => `'${a}'`).join(', ')}]` : undefined,
    hidden ? 'user-invocable: false' : undefined,
    '---'
  ].filter(Boolean).join('\n');
  return {
    file: `.github/agents/${name}.agent.md`,
    name,
    description,
    content: `${frontmatter}\n\n# ${name}\n\n${body}\n\n## Output contract\n\nReturn concise Markdown with:\n\n1. Assumptions\n2. Evidence\n3. Findings\n4. Required actions\n5. Validation checks\n6. Residual risks\n`
  };
}

function buildSubagentPromptResource(): string {
  return `# Subagent Orchestration Prompt\n\nUse this prompt when a task is complex enough to benefit from VS Code Copilot native subagents.\n\n## Decision rule\n\nUse subagents when the task has multiple independent perspectives, requires isolated codebase research, involves security/data/SQL/release review, or spans product + frontend + backend + data.\n\n## Required behavior\n\n1. Choose the minimum necessary subagents.\n2. Pass each subagent a narrow task and expected output.\n3. Ask subagents for evidence and validation checks, not long reasoning.\n4. Synthesize results into one final artifact.\n5. State disagreements and unresolved questions.\n\n## Available subagents\n\n${CORE_SUBAGENTS.map(a => `- ${a}`).join('\n')}\n`;
}

function buildSubagentSkill(): string {
  return `---\nname: subagent-orchestration\ndescription: Use VS Code Copilot custom agents as subagents for complex product engineering, frontend/backend/data development, SQL review, security review, release readiness, Ralph loop planning, and multi-perspective validation.\n---\n\n# Subagent Orchestration Skill\n\nUse this skill when a task is too broad for one context window or needs independent specialist review.\n\n## Trigger conditions\n\n- Full-stack work involving product, frontend, backend, and data.\n- Review tasks where independent perspectives reduce anchoring bias.\n- SQL/data/security/release tasks with high risk.\n- Ralph loop readiness and story validation.\n- Migration tasks involving multiple dialects, frameworks, or environments.\n\n## Execution\n\n1. Decide if delegation is useful.\n2. Choose only necessary subagents.\n3. Send narrow subtasks.\n4. Require each subagent to return evidence, findings, actions, and validation checks.\n5. Merge outputs into one prioritized result.\n\n## Safety\n\nDo not use nested subagents by default. Do not let subagents make broad unrelated changes. Do not delegate decisions that require human approval.\n`;
}

function buildDelegationMatrix(): string {
  return `# Delegation Matrix\n\n| Command / Situation | Recommended Subagents | Pattern |\n|---|---|---|\n| /prd, /story-split | prd-planner, quality-reviewer | sequential review |\n| /design-md, /ui-design | design-system-engineer, frontend-engineer | focused research |
| /architecture-diagram, /journey-diagram, /diagram | diagram-architect, quality-reviewer | diagram-as-code review |\n| /frontend | frontend-engineer, design-system-engineer, quality-reviewer | coordinator-worker |\n| /springboot | springboot-engineer, security-reviewer, quality-reviewer | coordinator-worker |\n| /python | python-engineer, security-reviewer, quality-reviewer | coordinator-worker |\n| /nl2sql, /sql-review, /sql-translate | sql-engineer, bank-data-engineer, security-reviewer | parallel review |\n| /data-review, /dq, /reconcile, /lineage | bank-data-engineer, sql-engineer, quality-reviewer | parallel review |\n| /release, /ralph-readiness | release-manager, quality-reviewer, security-reviewer | gate review |\n`;
}

function buildGithubSubagentPrompt(): string {
  return `---\nname: subagent-orchestration\ntools: ['agent', 'read', 'search', 'edit']\n---\n\nUse the workspace custom agents under .github/agents as subagents when the task is complex. Delegate only focused subtasks and synthesize the final result. Recommended workers: ${CORE_SUBAGENTS.join(', ')}.\n`;
}

function buildOpenCodeSubagentCommand(): string {
  return `# Subagent Plan\n\nOpenCode migration note: use .opencode/agents as the equivalent worker-agent catalog. For complex tasks, create a delegation plan with focused worker prompts and merge outputs into one final artifact.\n\nRead:\n\n- agent-resources/prompts/commands/subagent-orchestration.md\n- agent-resources/skills/subagent-orchestration/SKILL.md\n- .opencode/agents/*\n`;
}
