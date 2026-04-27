/**
 * User input optimizer.
 *
 * v1.3 design, inspired by copilot-prompt-optimizer:
 * - intent recognition first
 * - context awareness from active editor + attachments
 * - modular prompt sections: Role, Context, Objective, Scope, Constraints, Output, Quality Bar, Do Not
 * - multi-version optimization: Balanced, Concise, Detailed
 * - deterministic fallback so every command can use it without an extra model call
 *
 * This optimizer never invents company policy, data facts, schema fields, or acceptance thresholds.
 * It turns raw user input into an execution brief and records missing questions separately.
 */

import { ProductDevCommand, RepoContext } from '../core/types';
import { RequestContext } from '../context/request-context';

export interface OptimizedPromptVersion {
  label: 'Balanced' | 'Concise' | 'Detailed';
  prompt: string;
}

export interface OptimizedUserInput {
  command: ProductDevCommand;
  originalPrompt: string;
  normalizedGoal: string;
  detectedIntent: string;
  templateName: string;
  role: string;
  scope: string[];
  constraints: string[];
  requiredContext: string[];
  missingQuestions: string[];
  expectedOutput: string[];
  qualityChecks: string[];
  avoid: string[];
  appliedStrategies: string[];
  suggestedSkills: string[];
  contextSignals: string[];
  attachmentSignals: string[];
  optimizedPrompt: string;
  versions: OptimizedPromptVersion[];
}

const COMMAND_SCOPE: Partial<Record<ProductDevCommand, string[]>> = {
  frontend: ['UI pages/routes', 'components', 'state model', 'API hooks', 'UX states', 'accessibility', 'tests'],
  backend: ['service boundary', 'API', 'domain model', 'persistence', 'security', 'observability', 'tests'],
  springboot: ['Controller', 'DTO/validation', 'Service', 'Repository/Entity', 'transactions', 'OpenAPI', 'tests'],
  python: ['API routes', 'Pydantic schemas', 'service/repository layers', 'database access', 'tests', 'runtime'],
  data: ['source systems', 'target data products', 'modeling', 'DQ', 'lineage', 'privacy', 'runbook'],
  sql: ['SQL semantics', 'dialect', 'join safety', 'performance', 'validation SQL'],
  nl2sql: ['business question', 'SQL dialect', 'schema grounding', 'metric/dimension/grain', 'validation SQL'],
  'sql-translate': ['source dialect', 'target dialect', 'semantic preservation', 'function/type mapping', 'validation SQL'],
  'sql-review': ['SQL correctness', 'join/grain safety', 'performance', 'DQ/reconciliation', 'privacy/security'],
  dq: ['DQ dimensions', 'executable SQL checks', 'thresholds', 'alerts', 'exception handling'],
  datacontract: ['schema contract', 'ownership', 'SLA', 'grain', 'privacy', 'compatibility'],
  sttm: ['source fields', 'target fields', 'transformation rules', 'join rules', 'DQ/reconciliation'],
  reconcile: ['source/target counts', 'amount totals', 'window alignment', 'exception records', 'manual review'],
  lineage: ['table lineage', 'field lineage', 'sensitive propagation', 'downstream impact', 'Mermaid graph'],
  review: ['correctness', 'security', 'maintainability', 'tests', 'policy compliance'],
  'data-review': ['grain', 'joins', 'SQL performance', 'DQ', 'reconciliation', 'lineage', 'privacy', 'runbook'],
  prompt: ['role', 'task', 'context', 'constraints', 'output schema', 'evaluation rubric'],
  summarize: ['key facts', 'decisions', 'risks', 'open questions', 'next actions'],
  compress: ['goal', 'constraints', 'repo facts', 'decisions', 'current state', 'next action'],
  'story-split': ['source PRD/feature scope', 'story size', 'dependency order', 'acceptance criteria', 'validation evidence'],
  'prd-json': ['source PRD', 'branchName', 'userStories', 'passes status', 'acceptance criteria'],
  'ralph-readiness': ['prd.json schema', 'story size', 'quality gates', 'progress.txt', 'AGENTS.md/CLAUDE.md'],
  'design-md': ['visual theme', 'color tokens', 'typography', 'component styling', 'layout', 'responsive behavior', 'agent prompt guide'],
  'ui-design': ['target screen/feature', 'design direction', 'existing DESIGN.md', 'components', 'states', 'responsive behavior']
};

const COMMAND_OUTPUT: Partial<Record<ProductDevCommand, string[]>> = {
  init: ['technology-stack-specific project structure', 'Copilot/OpenCode assets', 'missing-decision questions'],
  frontend: ['frontend design', 'file-level plan', 'test plan', 'acceptance criteria'],
  backend: ['backend design', 'API/persistence plan', 'security/observability plan', 'test strategy'],
  springboot: ['Spring Boot layer design', 'package structure', 'code scaffold guidance', 'test plan'],
  python: ['Python backend structure', 'service/repository design', 'runtime commands', 'pytest plan'],
  data: ['data development plan', 'data governance impacts', 'implementation tasks'],
  sql: ['proposed SQL', 'optimization strategy', 'dialect notes', 'validation SQL'],
  nl2sql: ['generated SQL', 'assumptions', 'validation SQL', 'DQ/reconciliation checks', 'privacy/performance notes'],
  'sql-translate': ['translated SQL', 'mapping table', 'unsupported constructs', 'validation SQL', 'migration checklist'],
  'sql-review': ['severity-ranked findings', 'required fixes', 'rewritten SQL if needed', 'validation SQL'],
  dq: ['DQ rule table', 'executable SQL checks', 'thresholds', 'failure handling'],
  datacontract: ['data contract', 'compatibility matrix', 'approval workflow'],
  sttm: ['mapping table', 'transformation rules', 'exception handling'],
  review: ['severity-ranked findings', 'required fixes', 'approval decision'],
  'data-review': ['bank data review findings', 'approval decision', 'release blockers'],
  prompt: ['optimized prompt', 'variables', 'guardrails', 'rubric', 'concise/balanced/detailed variants'],
  summarize: ['executive summary', 'risks', 'decisions', 'actions'],
  compress: ['copy-ready compact context block'],
  'story-split': ['Ralph-sized story table', 'split decisions', 'quality checks', 'next command'],
  'prd-json': ['valid prd.json', 'conversion summary', 'story-size validation', 'next command'],
  'ralph-readiness': ['readiness decision', 'blockers', 'required fixes', 'safe next command'],
  'design-md': ['root DESIGN.md', 'source evidence', 'assumptions', 'agent prompt guide'],
  'ui-design': ['UI design spec', 'component rules', 'interaction states', 'implementation-ready guidance']
};

const DEFAULT_QUALITY_CHECKS = [
  'Goal is explicit, testable, and aligned with the command intent.',
  'Facts from repository, attachments, and user input are separated from assumptions.',
  'Constraints, non-goals, and output schema are visible.',
  'Missing context is expressed as targeted questions instead of guessed.',
  'The output can be reviewed, saved, and used by Copilot/OpenCode later.',
  'The answer ends with a concrete next command.'
];

export function optimizeUserInput(command: ProductDevCommand, rawPrompt: string, repo?: RepoContext, requestContext?: RequestContext): OptimizedUserInput {
  const originalPrompt = (rawPrompt || '').trim();
  const detectedIntent = detectIntent(command, originalPrompt);
  const templateName = selectTemplate(command, originalPrompt, repo);
  const role = roleFor(command, detectedIntent);
  const normalizedGoal = normalizeGoal(command, originalPrompt, detectedIntent);
  const scope = buildScope(command, originalPrompt, repo, requestContext);
  const constraints = buildConstraints(command, originalPrompt, repo, requestContext);
  const requiredContext = buildRequiredContext(command, originalPrompt, requestContext);
  const missingQuestions = buildMissingQuestions(command, originalPrompt, repo, requestContext);
  const expectedOutput = COMMAND_OUTPUT[command] ?? ['structured markdown artifact', 'assumptions', 'risks', 'next command'];
  const qualityChecks = buildQualityChecks(command);
  const avoid = buildAvoidList(command);
  const suggestedSkills = suggestSkills(command, originalPrompt, repo);
  const contextSignals = buildContextSignals(repo, requestContext);
  const attachmentSignals = buildAttachmentSignals(requestContext);
  const appliedStrategies = [
    'intent-recognition',
    'semantic-normalization',
    'context-awareness',
    'attachment-aware-grounding',
    'modular-prompt-sections',
    'output-schema-binding',
    'missing-context-questioning',
    'quality-bar-injection',
    'multi-version-prompt-optimization',
    'skill-matching',
    'subagent-delegation-planning'
  ];

  const optimizedPrompt = buildBalancedPrompt({ command, originalPrompt, normalizedGoal, detectedIntent, templateName, role, scope, constraints, requiredContext, missingQuestions, expectedOutput, qualityChecks, avoid, suggestedSkills, contextSignals, attachmentSignals, appliedStrategies, optimizedPrompt: '', versions: [] });
  const versions = buildVersions(role, normalizedGoal, scope, constraints, expectedOutput, qualityChecks, avoid, originalPrompt);

  return {
    command,
    originalPrompt,
    normalizedGoal,
    detectedIntent,
    templateName,
    role,
    scope,
    constraints,
    requiredContext,
    missingQuestions,
    expectedOutput,
    qualityChecks,
    avoid,
    appliedStrategies,
    suggestedSkills,
    contextSignals,
    attachmentSignals,
    optimizedPrompt,
    versions
  };
}

function detectIntent(command: ProductDevCommand, prompt: string): string {
  const text = `${command} ${prompt}`.toLowerCase();
  if (/(nl2sql|自然语言.*sql|生成sql|convert.*sql)/i.test(text)) return 'Natural language to SQL generation';
  if (/(sql[- ]?translate|方言|oracle|bigquery|maxcompute|odps|postgres|snowflake|hive|databricks)/i.test(text) && /(convert|translate|迁移|转换|改写)/i.test(text)) return 'SQL dialect translation';
  if (/(sql[- ]?review|review.*sql|join|grain|cardinality|partition|cost|explain)/i.test(text)) return 'SQL review and production readiness assessment';
  if (/(design\.md|design md|stitch|ui design|视觉|设计系统)/i.test(text)) return 'UI design system extraction or generation';
  if (/(dq|data quality|数据质量|完整性|唯一性|对账)/i.test(text)) return 'Bank-grade data quality and reconciliation design';
  if (/(bug|fix|报错|错误|debug|修复|排查)/i.test(text)) return 'Bug fixing and debugging';
  if (/(refactor|重构|优化代码|clean up)/i.test(text)) return 'Refactoring and code quality improvement';
  if (/(test|测试|单测|unit test|e2e)/i.test(text)) return 'Testing and verification';
  if (/(summary|summarize|总结|提炼|压缩)/i.test(text)) return 'Summarization or context compression';
  if (/(review|评审|检查|gate|门禁)/i.test(text)) return 'Review and quality gate assessment';
  return `${command} workflow execution`;
}

function selectTemplate(command: ProductDevCommand, prompt: string, repo?: RepoContext): string {
  const text = `${command} ${prompt} ${repo?.techStack.join(' ') ?? ''}`.toLowerCase();
  if (command === 'nl2sql') return 'nl2sql-grounded-generation';
  if (command === 'sql-translate') return 'sql-dialect-translation';
  if (command === 'sql-review') return 'sql-production-review';
  if (['story-split','prd-json','ralph-readiness'].includes(command)) return 'ralph-prd-loop';
  if (command === 'design-md' || command === 'ui-design') return 'design-md-ui-system';
  if (/spring|java/.test(text)) return 'springboot-engineering';
  if (/python|fastapi|flask/.test(text)) return 'python-engineering';
  if (/react|vue|angular|tailwind|mui/.test(text)) return 'frontend-engineering';
  if (/bigquery|maxcompute|odps|oracle|postgres|snowflake|hive|databricks/.test(text)) return 'data-sql-engineering';
  return `${command}-standard`;
}

function roleFor(command: ProductDevCommand, intent: string): string {
  if (command === 'prompt') return 'Act as a principal prompt engineer who designs high-precision, context-aware prompts for Copilot, OpenCode, Claude Code, Codex, and agent workflows.';
  if (['story-split','prd-json','ralph-readiness'].includes(command)) return 'Act as a Ralph PRD and autonomous-loop planning expert who creates small, dependency-safe, verifiable stories and durable loop memory files.';
  if (['nl2sql', 'sql', 'sql-review', 'sql-translate'].includes(command)) return 'Act as a senior database engineer and bank-grade SQL reviewer with expertise in PostgreSQL, Oracle, BigQuery, MaxCompute/ODPS, Snowflake, SQL Server, Databricks/Spark SQL, Hive, and MySQL.';
  if (['data','dq','sttm','datacontract','reconcile','lineage','pipeline','scheduler','data-review','data-test','privacy','runbook','semantic','catalog','cost'].includes(command)) return 'Act as a bank data department senior data engineer responsible for contract-first data delivery, DQ, reconciliation, lineage, privacy, scheduling, cost, and production runbooks.';
  if (['frontend','design-md','ui-design'].includes(command)) return 'Act as a senior frontend architect and design-system engineer who can extract or generate implementation-ready UI design rules.';
  if (command === 'springboot') return 'Act as a senior Java Spring Boot engineer responsible for layered architecture, API contracts, validation, security, tests, and production readiness.';
  if (command === 'python') return 'Act as a senior Python backend/data engineer responsible for FastAPI/Flask services, data access, validation, tests, and operations.';
  return `Act as a senior enterprise software delivery expert for ${intent}.`;
}

function normalizeGoal(command: ProductDevCommand, prompt: string, intent: string): string {
  const trimmed = prompt || '(no explicit prompt provided)';
  switch (command) {
    case 'nl2sql': return `Convert the business question into dialect-aware, validated SQL without inventing unavailable schema: ${trimmed}`;
    case 'sql-translate': return `Translate SQL between dialects while preserving semantics and surfacing incompatibilities: ${trimmed}`;
    case 'sql-review': return `Review SQL for correctness, grain, join safety, DQ, reconciliation, privacy, performance, and production risk: ${trimmed}`;
    case 'prompt': return `Optimize the user's raw prompt into concise, balanced, and detailed variants: ${trimmed}`;
    case 'design-md': return `Extract or generate a DESIGN.md from frontend UI evidence and user design intent: ${trimmed}`;
    default: return `Execute the /${command} workflow for intent "${intent}" using the user's request: ${trimmed}`;
  }
}

function buildScope(command: ProductDevCommand, prompt: string, repo?: RepoContext, requestContext?: RequestContext): string[] {
  const scope = [...(COMMAND_SCOPE[command] ?? ['current command objective', 'repository context', 'policy packs', 'output artifact'])];
  if (repo?.techStack.length) scope.push(`Repository tech stack hints: ${repo.techStack.slice(0, 8).join(', ')}`);
  if (requestContext?.activeEditor) scope.push(`Active editor: ${requestContext.activeEditor.relativePath ?? requestContext.activeEditor.fileName}`);
  if (requestContext?.attachments.length) scope.push(`Attached context files/references: ${requestContext.attachments.map(a => a.name).join(', ')}`);
  if (/当前|existing|现有|repo|项目/.test(prompt)) scope.push('Prioritize evidence from the current repository and attachments before generic guidance.');
  return unique(scope);
}

function buildConstraints(command: ProductDevCommand, prompt: string, repo?: RepoContext, requestContext?: RequestContext): string[] {
  const constraints = [
    'Preserve the user intent; do not silently change the task.',
    'Ground conclusions in repository evidence, user-supplied attachments, policy packs, and skills.',
    'If required context is missing, ask targeted questions and list assumptions separately.',
    'Produce a reviewable artifact with clear sections and next command.'
  ];
  if (requestContext?.attachments.length) constraints.push('Treat chat attachments and file references as first-class context. Cite attachment names in assumptions and evidence sections.');
  if (shouldConsiderSubagents(command, prompt, repo, requestContext)) constraints.push('For complex or multi-disciplinary work, consider VS Code Copilot subagents: delegate focused research/review tasks to workspace custom agents and synthesize concise results.');
  if (repo?.policyPacks?.files?.length) constraints.push('Apply local Policy Pack rules before generic defaults.');
  if (['nl2sql','sql','sql-review','sql-translate'].includes(command)) {
    constraints.push('Always state SQL dialect, schema assumptions, grain, join strategy, validation SQL, and performance/cost risks.');
    constraints.push('Do not invent table or field names when schema evidence is missing; ask for schema or provide placeholders explicitly.');
  }
  if (['story-split','prd-json','ralph-readiness'].includes(command)) {
    constraints.push('Use one-story-per-iteration Ralph constraints: small scope, dependency ordering, verifiable acceptance criteria, and external memory files.');
  }
  if (['data','dq','reconcile','lineage','pipeline','data-review'].includes(command)) {
    constraints.push('Include data contract, STTM, DQ, reconciliation, lineage, privacy, scheduling, backfill, and runbook impacts when relevant.');
  }
  if (command === 'init') constraints.push('Generate only structures matching the explicit technology stack; do not generate Java and Python backend structures unless both are requested.');
  return unique(constraints);
}

function buildRequiredContext(command: ProductDevCommand, prompt: string, requestContext?: RequestContext): string[] {
  const required = ['user goal', 'target command', 'repository evidence', 'local policies/skills'];
  if (requestContext?.activeEditor) required.push('active editor selection/surrounding code');
  if (requestContext?.attachments.length) required.push('attached files/references');
  if (['story-split','prd-json','ralph-readiness'].includes(command)) required.push('source PRD or feature scope', 'quality commands', 'project stack', 'AGENTS.md/CLAUDE.md conventions');
  if (['nl2sql','sql','sql-review','sql-translate'].includes(command)) required.push('database dialect', 'tables/columns/schema', 'metric definitions', 'data grain');
  if (['frontend','design-md','ui-design'].includes(command)) required.push('design tokens/theme files/components/routes');
  if (['springboot','python','backend'].includes(command)) required.push('API contract/domain model/security requirements');
  return unique(required);
}

function buildMissingQuestions(command: ProductDevCommand, prompt: string, repo?: RepoContext, requestContext?: RequestContext): string[] {
  const questions: string[] = [];
  const text = `${prompt} ${repo?.techStack.join(' ') ?? ''}`.toLowerCase();
  if (!prompt.trim()) questions.push('What is the concrete task or business outcome you want this command to produce?');
  if (command === 'init' && !/(react|vue|angular|spring|java|python|fastapi|flask|postgres|oracle|bigquery|maxcompute|odps)/i.test(text)) questions.push('Which exact frontend, backend, and data/database stack should be generated?');
  if (command === 'nl2sql' && !/(postgres|oracle|bigquery|maxcompute|odps|mysql|sql server|snowflake|databricks|hive)/i.test(text)) questions.push('Which SQL dialect should be used?');
  if (['story-split','prd-json','ralph-readiness'].includes(command) && !(requestContext?.attachments.length) && !/(US-\d+|user stor|acceptance|prd|需求|验收)/i.test(prompt)) questions.push('Please attach or paste the PRD/feature design so stories can be split and converted safely.');
  if (['nl2sql','sql-review','sql-translate'].includes(command) && !(requestContext?.attachments.length) && !/(create table|select |schema|字段|table|column)/i.test(prompt)) questions.push('Please attach schema DDL, table descriptions, or sample SQL for stronger grounding.');
  if (command === 'sql-translate' && !/(to|->|转换为|转成|目标)/i.test(prompt)) questions.push('What is the source dialect and target dialect?');
  if (['dq','reconcile'].includes(command) && !/(threshold|阈值|sla|金额|count|sum|规则)/i.test(prompt)) questions.push('What DQ thresholds, reconciliation tolerances, and SLA rules apply in your department/country?');
  if (['design-md','ui-design'].includes(command) && !(requestContext?.attachments.length) && !repo?.frontendHints?.length) questions.push('Which frontend files, theme files, screenshots, or design references should be used as source evidence?');
  return unique(questions);
}

function buildQualityChecks(command: ProductDevCommand): string[] {
  const checks = [...DEFAULT_QUALITY_CHECKS];
  if (['story-split','prd-json','ralph-readiness'].includes(command)) checks.push('Stories are one-iteration sized, dependency-ordered, and acceptance criteria are verifiable.');
  if (['nl2sql','sql','sql-review','sql-translate'].includes(command)) checks.push('SQL includes validation queries and dialect-specific caveats.');
  if (['dq','reconcile','data-review'].includes(command)) checks.push('Data quality and reconciliation are executable, thresholded, and operationally actionable.');
  if (['design-md','ui-design','frontend'].includes(command)) checks.push('UI design rules distinguish evidence from assumptions and are implementation-ready.');
  return unique(checks);
}

function buildAvoidList(command: ProductDevCommand): string[] {
  const avoid = [
    'Do not invent company, department, or country policy thresholds.',
    'Do not hide assumptions inside requirements.',
    'Do not ignore attached files or active selection when they are present.',
    'Do not produce unstructured prose when a structured artifact is expected.'
  ];
  if (['story-split','prd-json','ralph-readiness'].includes(command)) avoid.push('Do not create broad multi-feature stories; do not mark passes:true; do not hide dependencies or vague acceptance criteria.');
  if (['nl2sql','sql','sql-review','sql-translate'].includes(command)) avoid.push('Do not invent tables/columns; do not omit grain, join safety, partition, or validation steps.');
  if (command === 'init') avoid.push('Do not generate unrelated technology-stack folders.');
  return unique(avoid);
}

function suggestSkills(command: ProductDevCommand, prompt: string, repo?: RepoContext): string[] {
  const text = `${command} ${prompt} ${repo?.techStack.join(' ') ?? ''}`.toLowerCase();
  const skills = new Set<string>();
  skills.add('prompt-input-optimizer');
  if (/(sql|postgres|oracle|bigquery|maxcompute|odps|snowflake|hive|databricks)/.test(text)) skills.add('sql-engineering');
  if (command === 'nl2sql') skills.add('nl2sql');
  if (['prd','story-split','prd-json'].includes(command)) skills.add('prd-planning');
  if (['story-split','prd-json'].includes(command)) skills.add('ralph-prd');
  if (['ralph-readiness','loop','loop-next'].includes(command)) skills.add('ralph-loop');
  if (command === 'sql-review') skills.add('sql-review');
  if (command === 'sql-translate') skills.add('sql-translate');
  if (/(data|dq|reconcile|lineage|sttm|contract)/.test(text)) skills.add('bank-data-engineering');
  if (/(react|vue|angular|frontend|design\.md|ui)/.test(text)) skills.add('frontend-review');
  if (/(spring|java)/.test(text)) skills.add('springboot-engineering');
  if (/(python|fastapi|flask)/.test(text)) skills.add('python-engineering');
  if (shouldConsiderSubagents(command, prompt, repo)) skills.add('subagent-orchestration');
  if (command === 'prompt') skills.add('prompt-quality');
  return [...skills];
}

function buildContextSignals(repo?: RepoContext, requestContext?: RequestContext): string[] {
  const signals: string[] = [];
  if (repo?.repoName) signals.push(`repo=${repo.repoName}`);
  if (repo?.techStack.length) signals.push(`techStack=${repo.techStack.slice(0, 8).join(',')}`);
  if (repo?.policyPacks?.files?.length) signals.push(`policyFiles=${repo.policyPacks.files.length}`);
  if (requestContext?.activeEditor) signals.push(`activeFile=${requestContext.activeEditor.relativePath ?? requestContext.activeEditor.fileName}`);
  return signals;
}

function buildAttachmentSignals(requestContext?: RequestContext): string[] {
  if (!requestContext?.attachments.length) return [];
  return requestContext.attachments.map(a => `${a.name}${a.path ? ` (${a.path})` : ''}${a.warning ? ` [${a.warning}]` : ''}`);
}

function buildBalancedPrompt(input: Omit<OptimizedUserInput, 'optimizedPrompt' | 'versions'> & { optimizedPrompt: string; versions: OptimizedPromptVersion[] }): string {
  return [
    '# Role', input.role,
    '# Context Signals', ...bullet(input.contextSignals.length ? input.contextSignals : ['No additional request context signals.']),
    '# Objective', input.normalizedGoal,
    '# Scope', ...bullet(input.scope),
    '# Required Context', ...bullet(input.requiredContext),
    '# Constraints', ...bullet(input.constraints),
    '# Expected Output', ...bullet(input.expectedOutput),
    '# Quality Bar', ...bullet(input.qualityChecks),
    '# Missing Questions', ...bullet(input.missingQuestions.length ? input.missingQuestions : ['No blocking questions detected; proceed with explicit assumptions.']),
    '# Do Not', ...bullet(input.avoid)
  ].join('\n');
}

function buildVersions(role: string, goal: string, scope: string[], constraints: string[], output: string[], quality: string[], avoid: string[], original: string): OptimizedPromptVersion[] {
  const concise = [`Role: ${role}`, `Task: ${goal}`, `Scope: ${scope.slice(0, 4).join('; ')}`, `Constraints: ${constraints.slice(0, 4).join('; ')}`, `Output: ${output.join('; ')}`].join('\n');
  const balanced = [
    '# Role', role,
    '# Task', goal,
    '# Scope', ...bullet(scope),
    '# Constraints', ...bullet(constraints),
    '# Output', ...bullet(output),
    '# Quality Bar', ...bullet(quality),
    '# Original User Request', original || '(empty)'
  ].join('\n');
  const detailed = [
    balanced,
    '# Verification',
    '- State assumptions separately from evidence.',
    '- Provide validation or test steps.',
    '- Identify risks and missing context.',
    '# Do Not',
    ...bullet(avoid)
  ].join('\n');
  return [
    { label: 'Balanced', prompt: balanced },
    { label: 'Concise', prompt: concise },
    { label: 'Detailed', prompt: detailed }
  ];
}

export function renderOptimizedUserInput(input: OptimizedUserInput): string {
  return `## Optimized User Input

` +
    `- Command: /${input.command}\n` +
    `- Detected Intent: ${input.detectedIntent}\n` +
    `- Template: ${input.templateName}\n` +
    `- Normalized Goal: ${input.normalizedGoal}\n` +
    `- Applied Strategies: ${input.appliedStrategies.join(', ')}\n` +
    `- Suggested Skills: ${input.suggestedSkills.length ? input.suggestedSkills.join(', ') : 'None'}\n` +
    `- Context Signals: ${input.contextSignals.length ? input.contextSignals.join('; ') : 'None'}\n` +
    `- Attachment Signals: ${input.attachmentSignals.length ? input.attachmentSignals.join('; ') : 'None'}\n\n` +
    `### Scope\n${bullet(input.scope).join('\n')}\n\n` +
    `### Constraints\n${bullet(input.constraints).join('\n')}\n\n` +
    `### Expected Output\n${bullet(input.expectedOutput).join('\n')}\n\n` +
    `### Missing Questions\n${bullet(input.missingQuestions.length ? input.missingQuestions : ['No blocking missing questions detected.']).join('\n')}\n\n` +
    `### Balanced Optimized Prompt\n\n\`\`\`text\n${input.versions.find(v => v.label === 'Balanced')?.prompt ?? input.optimizedPrompt}\n\`\`\``;
}

function bullet(items: string[]): string[] {
  return items.map(i => `- ${i}`);
}

function unique(items: string[]): string[] {
  return [...new Set(items.map(i => i.trim()).filter(Boolean))];
}

function shouldConsiderSubagents(command: ProductDevCommand, prompt: string, repo?: RepoContext, requestContext?: RequestContext): boolean {
  const text = `${command} ${prompt} ${repo?.techStack.join(' ') ?? ''}`.toLowerCase();
  const complexCommands: ProductDevCommand[] = ['plan','prd','story-split','frontend','backend','springboot','python','data','dq','reconcile','lineage','pipeline','data-review','sql-review','sql-translate','nl2sql','design-md','ui-design','review','quality','release','ralph-readiness'];
  if (complexCommands.includes(command)) return true;
  if ((requestContext?.attachments.length ?? 0) > 1) return true;
  return /(复杂|fullstack|全栈|多模块|多系统|security|安全|data|sql|review|评审|migration|迁移|release|上线)/i.test(text);
}
