/**
 * Product Dev Copilot Source Note
 *
 * File: src/scaffold/project-initializer.ts
 * Purpose: Technology-stack driven project scaffold generator for frontend, backend, data, Copilot, and opencode assets.
 *
 * Design principle:
 * - /init must generate only the folders that match the user's declared technology stack.
 * - If the user says Java/Spring Boot, do not create Python backend folders.
 * - If the user says Python/FastAPI, do not create Java backend folders.
 * - If the user says data + PostgreSQL, do not create Oracle/BigQuery/MaxCompute folders unless requested.
 * - If the stack is ambiguous, create decision-required files and ask targeted questions instead of guessing too much.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ensureDir, exists } from '../utils/fs-utils';
import { initializePolicyPacks } from '../policies/policy-pack-initializer';
import { initializeSkills } from '../skills/skill-initializer';
import { initializePortableAgentResources } from '../resources/portable-resource-initializer';

export type InitTrack = 'frontend' | 'backend' | 'data';
export type FrontendStack = 'react' | 'vue' | 'angular' | 'generic';
export type BackendStack = 'springboot' | 'python-fastapi' | 'python-flask' | 'python-generic' | 'node' | 'go' | 'decision-required';
export type DataEngine = 'postgresql' | 'oracle' | 'bigquery' | 'maxcompute' | 'mysql' | 'sqlserver' | 'snowflake' | 'databricks' | 'hive' | 'decision-required';
export type AgentTooling = 'copilot' | 'opencode';

export interface InitSpec {
  tracks: InitTrack[];
  frontendStacks: FrontendStack[];
  backendStacks: BackendStack[];
  dataEngines: DataEngine[];
  agentTooling: AgentTooling[];
  rawPrompt: string;
  ambiguous: boolean;
  missingDecisions: string[];
}

export interface InitResult {
  spec: InitSpec;
  tracks: InitTrack[];
  createdDirectories: string[];
  createdFiles: string[];
  questionFile: string;
  projectProfileFile: string;
  sessionFile: string;
  markdown: string;
}

/**
 * Parse the user's /init prompt into a concrete scaffold specification.
 *
 * Important behavior:
 * - Explicit stacks win over broad tracks.
 * - `fullstack` does not mean "generate every possible framework"; it means create all tracks,
 *   but only stack-specific folders for stacks the user names.
 * - Ambiguous tracks produce decision-required docs rather than unrelated code folders.
 */
export function detectInitSpec(userPrompt: string): InitSpec {
  const text = normalize(userPrompt);
  const tracks = new Set<InitTrack>();
  const frontendStacks = new Set<FrontendStack>();
  const backendStacks = new Set<BackendStack>();
  const dataEngines = new Set<DataEngine>();
  const agentTooling = new Set<AgentTooling>();
  const missingDecisions: string[] = [];

  const wantsFullstack = hasAny(text, ['fullstack', 'full stack', '全栈', '完整项目', '完整结构', '完整初始项目']);
  const wantsFrontend = wantsFullstack || hasAny(text, ['frontend', 'front end', 'react', 'vue', 'angular', '前端', 'ui', '页面']);
  const wantsBackend = wantsFullstack || hasAny(text, ['backend', 'back end', 'spring', 'springboot', 'spring boot', 'java', 'python', 'fastapi', 'flask', 'node', 'golang', 'go ', '后端', '服务端']);
  const wantsData = wantsFullstack || hasAny(text, ['data', 'sql', 'postgres', 'postgresql', 'oracle', 'bigquery', 'maxcompute', 'odps', 'mysql', 'sqlserver', 'sql server', 'snowflake', 'databricks', 'hive', '数据', '数仓', '数据开发']);

  if (wantsFrontend) tracks.add('frontend');
  if (wantsBackend) tracks.add('backend');
  if (wantsData) tracks.add('data');

  if (hasAny(text, ['react', 'vite', 'next.js', 'nextjs'])) frontendStacks.add('react');
  if (hasAny(text, ['vue', 'nuxt'])) frontendStacks.add('vue');
  if (hasAny(text, ['angular'])) frontendStacks.add('angular');

  if (hasAny(text, ['springboot', 'spring boot', 'spring', 'java', 'jvm'])) backendStacks.add('springboot');
  if (hasAny(text, ['fastapi'])) backendStacks.add('python-fastapi');
  if (hasAny(text, ['flask'])) backendStacks.add('python-flask');
  if (hasAny(text, ['python']) && !hasAny(text, ['fastapi', 'flask'])) backendStacks.add('python-fastapi');
  if (hasAny(text, ['node', 'nestjs', 'express'])) backendStacks.add('node');
  if (hasAny(text, ['golang', 'go backend', 'go服务', 'go 项目'])) backendStacks.add('go');

  if (hasAny(text, ['postgresql', 'postgres', 'pg数据库'])) dataEngines.add('postgresql');
  if (hasAny(text, ['oracle'])) dataEngines.add('oracle');
  if (hasAny(text, ['bigquery', 'bq'])) dataEngines.add('bigquery');
  if (hasAny(text, ['maxcompute', 'odps'])) dataEngines.add('maxcompute');
  if (hasAny(text, ['mysql'])) dataEngines.add('mysql');
  if (hasAny(text, ['sqlserver', 'sql server', 'mssql'])) dataEngines.add('sqlserver');
  if (hasAny(text, ['snowflake'])) dataEngines.add('snowflake');
  if (hasAny(text, ['databricks', 'spark'])) dataEngines.add('databricks');
  if (hasAny(text, ['hive'])) dataEngines.add('hive');

  if (hasAny(text, ['opencode', 'open code'])) agentTooling.add('opencode');
  if (hasAny(text, ['copilot', 'vscode copilot', 'github copilot'])) agentTooling.add('copilot');
  if (agentTooling.size === 0 || hasAny(text, ['ai ide', 'agent', '智能体', '标准必备'])) {
    agentTooling.add('copilot');
    agentTooling.add('opencode');
  }

  if (tracks.size === 0) {
    // Do not generate every stack by default. Create governance/context assets and ask for the actual stack.
    missingDecisions.push('Which tracks should be initialized: frontend, backend, data, or fullstack?');
  }

  if (tracks.has('frontend') && frontendStacks.size === 0) {
    frontendStacks.add('generic');
    missingDecisions.push('Frontend framework is missing. Please specify React, Vue, Angular, or another framework.');
  }
  if (tracks.has('backend') && backendStacks.size === 0) {
    backendStacks.add('decision-required');
    missingDecisions.push('Backend stack is missing. Please specify Java Spring Boot, Python FastAPI/Flask, Node, Go, or another stack.');
  }
  if (tracks.has('data') && dataEngines.size === 0) {
    dataEngines.add('decision-required');
    missingDecisions.push('Data engine is missing. Please specify PostgreSQL, Oracle, BigQuery, MaxCompute, Hive, Snowflake, etc.');
  }

  return {
    tracks: Array.from(tracks),
    frontendStacks: Array.from(frontendStacks),
    backendStacks: Array.from(backendStacks),
    dataEngines: Array.from(dataEngines),
    agentTooling: Array.from(agentTooling),
    rawPrompt: userPrompt,
    ambiguous: missingDecisions.length > 0,
    missingDecisions
  };
}

/** Compatibility wrapper retained for older tests/imports. */
export function detectInitTracks(userPrompt: string): InitTrack[] {
  return detectInitSpec(userPrompt).tracks;
}

/**
 * Create the initial repository scaffold.
 *
 * The initializer is idempotent: it creates missing files but never overwrites files that a team already edited.
 */
export async function initializeProjectScaffold(root: string, userPrompt: string): Promise<InitResult> {
  const spec = detectInitSpec(userPrompt);
  const tracks = spec.tracks;
  const createdDirectories: string[] = [];
  const createdFiles: string[] = [];

  async function mkdir(relativePath: string): Promise<void> {
    const absolute = path.join(root, relativePath);
    await ensureDir(absolute);
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

  await createCommonScaffold(spec, mkdir, writeIfMissing);
  await createAgentToolingScaffold(spec, mkdir, writeIfMissing);

  if (tracks.includes('frontend')) {
    await createFrontendScaffold(spec, mkdir, writeIfMissing);
  }
  if (tracks.includes('backend')) {
    await createBackendScaffold(spec, mkdir, writeIfMissing);
  }
  if (tracks.includes('data')) {
    await createDataScaffold(spec, mkdir, writeIfMissing);
  }

  const questionFile = 'docs/00-intake/PROJECT_BACKGROUND_QUESTIONNAIRE.md';
  const projectProfileFile = 'docs/context/project-profile.yaml';
  const sessionFile = '.product-dev/init-session.local.json';

  await writeIfMissing(questionFile, buildQuestionnaire(spec));
  await writeIfMissing(projectProfileFile, buildProjectProfileTemplate(spec));
  await writeIfMissing('.product-dev/config.yaml', buildProductDevConfig(spec));
  await writeIfMissing(sessionFile, JSON.stringify({
    active: true,
    stage: spec.ambiguous ? 'stack-intake' : 'intake',
    tracks,
    frontendStacks: spec.frontendStacks,
    backendStacks: spec.backendStacks,
    dataEngines: spec.dataEngines,
    agentTooling: spec.agentTooling,
    missingDecisions: spec.missingDecisions,
    createdAt: new Date().toISOString(),
    nextCommand: spec.ambiguous ? 'intake' : 'policy-intake',
    expectedUserAction: spec.ambiguous
      ? 'Answer missing technology-stack decisions, then rerun @product-dev /init with explicit stack names.'
      : 'Answer the questionnaire or run @product-dev /context with project background.'
  }, null, 2));

  const policyResult = await initializePolicyPacks(root);
  createdDirectories.push(...policyResult.createdDirectories);
  createdFiles.push(...policyResult.createdFiles);

  const skillResult = await initializeSkills(root);
  createdDirectories.push(...skillResult.createdDirectories);
  createdFiles.push(...skillResult.createdFiles);

  const portableResult = await initializePortableAgentResources(root);
  createdDirectories.push(...portableResult.createdDirectories);
  createdFiles.push(...portableResult.createdFiles);

  const markdown = renderInitReport(spec, createdDirectories, createdFiles, questionFile, projectProfileFile, sessionFile);
  return { spec, tracks, createdDirectories, createdFiles, questionFile, projectProfileFile, sessionFile, markdown };
}

async function createCommonScaffold(
  spec: InitSpec,
  mkdir: (relativePath: string) => Promise<void>,
  writeIfMissing: (relativePath: string, content: string) => Promise<void>
): Promise<void> {
  const dirs = [
    '.product-dev',
    'docs/00-intake',
    'docs/01-product',
    'docs/02-architecture',
    'docs/03-api',
    'docs/07-quality',
    'docs/08-release',
    'docs/09-runbook',
    'docs/context',
    'docs/decisions',
    'docs/agent',
    'docs/skills'
  ];
  for (const dir of dirs) await mkdir(dir);

  await writeIfMissing('docs/decisions/0001-project-initialization.md', `# ADR-0001: Project Initialization\n\n## Status\n\nDraft\n\n## Requested scaffold\n\n\`${spec.rawPrompt || '@product-dev /init'}\`\n\n## Detected tracks\n\n${spec.tracks.length ? spec.tracks.map(t => `- ${t}`).join('\n') : '- Pending user decision'}\n\n## Detected stacks\n\n- Frontend: ${spec.frontendStacks.join(', ') || 'TBD'}\n- Backend: ${spec.backendStacks.join(', ') || 'TBD'}\n- Data engines: ${spec.dataEngines.join(', ') || 'TBD'}\n\n## Missing decisions\n\n${spec.missingDecisions.length ? spec.missingDecisions.map(d => `- ${d}`).join('\n') : '- None'}\n`);

  await writeIfMissing('docs/agent/AI_DELIVERY_RULES.md', buildAgentDeliveryRules(spec));
}

async function createAgentToolingScaffold(
  spec: InitSpec,
  mkdir: (relativePath: string) => Promise<void>,
  writeIfMissing: (relativePath: string, content: string) => Promise<void>
): Promise<void> {
  if (spec.agentTooling.includes('copilot')) {
    const dirs = ['.github', '.github/prompts', '.github/instructions', '.vscode'];
    for (const dir of dirs) await mkdir(dir);
    await writeIfMissing('.github/copilot-instructions.md', buildCopilotInstructions(spec));
    await writeIfMissing('.github/prompts/product-dev-workflow.prompt.md', buildCopilotPromptFile(spec));
    await writeIfMissing('.github/prompts/design-md.prompt.md', 'Use agent-resources/prompts/commands/design-md.md and agent-resources/skills/design-md/SKILL.md to generate or update root DESIGN.md from repository evidence. Follow the Stitch-compatible section structure and separate evidence from assumptions.');
    await writeIfMissing('.github/prompts/nl2sql.prompt.md', 'Use agent-resources/prompts/commands/nl2sql.md to convert natural language to SQL. Include dialect, assumptions, generated SQL, validation SQL, DQ/reconciliation, privacy, and performance notes.');
    await writeIfMissing('.github/prompts/sql-translate.prompt.md', 'Use agent-resources/prompts/commands/sql-translate.md to translate SQL across PostgreSQL, Oracle, BigQuery, MaxCompute/ODPS, MySQL, SQL Server, Snowflake, Databricks/Spark SQL, and Hive.');
    await writeIfMissing('.github/prompts/sql-review.prompt.md', 'Use agent-resources/prompts/commands/sql-review.md to review SQL for correctness, performance, DQ, reconciliation, privacy, and production readiness.');
    await writeIfMissing('.github/prompts/story-split.prompt.md', 'Use agent-resources/prompts/commands/story-split.md and agent-resources/skills/ralph-prd/references/story-sizing.md to split broad scope into one-iteration stories.');
    await writeIfMissing('.github/prompts/prd-json.prompt.md', 'Use agent-resources/prompts/commands/prd-json.md and agent-resources/skills/ralph-prd/SKILL.md to convert PRD Markdown into scripts/ralph/prd.json.');
    await writeIfMissing('.github/prompts/ralph-readiness.prompt.md', 'Use agent-resources/prompts/commands/ralph-readiness.md and agent-resources/skills/ralph-loop/SKILL.md to review autonomous-loop readiness.');
    await writeIfMissing('.github/instructions/product-dev.instructions.md', buildCopilotInstructionFile(spec));
    await writeIfMissing('.github/pull_request_template.md', buildPullRequestTemplate(spec));
    await writeIfMissing('.vscode/extensions.json', JSON.stringify({
      recommendations: ['GitHub.copilot', 'GitHub.copilot-chat']
    }, null, 2));
    await writeIfMissing('.vscode/settings.json', JSON.stringify({
      'github.copilot.chat.codeGeneration.useInstructionFiles': true,
      'github.copilot.chat.reviewSelection.instructions': [
        { file: '.github/instructions/product-dev.instructions.md' }
      ]
    }, null, 2));
  }

  if (spec.agentTooling.includes('opencode')) {
    const dirs = ['.opencode', '.opencode/agents', '.opencode/commands'];
    for (const dir of dirs) await mkdir(dir);
    await writeIfMissing('AGENTS.md', buildAgentsMd(spec));
    await writeIfMissing('.opencode/opencode.jsonc', buildOpencodeConfig(spec));
    await writeIfMissing('.opencode/agents/product-architect.md', buildOpencodeAgent('product-architect', 'Own product requirements, scope, user journey, and acceptance criteria.'));
    await writeIfMissing('.opencode/agents/code-reviewer.md', buildOpencodeAgent('code-reviewer', 'Review code for correctness, security, maintainability, testability, and policy compliance.'));
    await writeIfMissing('.opencode/agents/design-system-engineer.md', buildOpencodeAgent('design-system-engineer', 'Own DESIGN.md extraction/generation, visual tokens, UI component rules, accessibility, and frontend design consistency.'));
    await writeIfMissing('.opencode/agents/sql-engineer.md', buildOpencodeAgent('sql-engineer', 'Own NL2SQL, SQL dialect translation, SQL review, DQ, reconciliation, lineage, and SQL performance across PostgreSQL, Oracle, BigQuery, MaxCompute/ODPS, Hive, Snowflake, and Databricks.'));
    if (spec.tracks.includes('data')) {
      await writeIfMissing('.opencode/agents/data-engineer.md', buildOpencodeAgent('data-engineer', 'Own bank-grade data contract, STTM, SQL, DQ, reconciliation, lineage, scheduler, privacy, and runbook design.'));
    }
    await writeIfMissing('.opencode/commands/plan.md', buildOpencodeCommand('plan', 'Create an ordered implementation plan using docs/context/project-profile.yaml, AGENTS.md, and policy packs.'));
    await writeIfMissing('.opencode/commands/review.md', buildOpencodeCommand('review', 'Review the current changes against PRD, API/data contracts, tests, and local policy packs.'));
    await writeIfMissing('.opencode/commands/loop-next.md', buildOpencodeCommand('loop-next', 'Read .product-dev/ralph-loop.local.json and continue the next pending task with a small, reviewable change.'));
    await writeIfMissing('.opencode/commands/design-md.md', buildOpencodeCommand('design-md', 'Read agent-resources/prompts/commands/design-md.md and agent-resources/skills/design-md/SKILL.md. Generate or update root DESIGN.md from frontend code evidence or user visual direction.'));
    await writeIfMissing('.opencode/commands/nl2sql.md', buildOpencodeCommand('nl2sql', 'Read agent-resources/prompts/commands/nl2sql.md and convert the business question into dialect-aware SQL with validation, DQ, reconciliation, privacy, and performance notes.'));
    await writeIfMissing('.opencode/commands/sql-translate.md', buildOpencodeCommand('sql-translate', 'Read agent-resources/prompts/commands/sql-translate.md and translate SQL between mainstream dialects including PostgreSQL, Oracle, BigQuery, MaxCompute/ODPS, Hive, Snowflake, and Databricks.'));
    await writeIfMissing('.opencode/commands/sql-review.md', buildOpencodeCommand('sql-review', 'Read agent-resources/prompts/commands/sql-review.md and review SQL for correctness, join/grain safety, DQ, reconciliation, privacy, performance, and production readiness.'));
    await writeIfMissing('.opencode/commands/story-split.md', buildOpencodeCommand('story-split', 'Read agent-resources/prompts/commands/story-split.md and agent-resources/skills/ralph-prd/references/story-sizing.md. Split requirements into one-iteration stories.'));
    await writeIfMissing('.opencode/commands/prd-json.md', buildOpencodeCommand('prd-json', 'Read agent-resources/prompts/commands/prd-json.md and agent-resources/skills/ralph-prd/SKILL.md. Convert PRD Markdown into scripts/ralph/prd.json.'));
    await writeIfMissing('.opencode/commands/ralph-readiness.md', buildOpencodeCommand('ralph-readiness', 'Read agent-resources/prompts/commands/ralph-readiness.md and agent-resources/skills/ralph-loop/SKILL.md. Check whether autonomous-loop execution is safe.'));
    await writeIfMissing('scripts/ralph/progress.txt', buildRalphProgressTemplate());
    await writeIfMissing('scripts/ralph/prd.json.example', buildRalphPrdJsonExample());
    await writeIfMissing('scripts/ralph/prompt.md', buildRalphPromptTemplate());
    await writeIfMissing('scripts/ralph/CLAUDE.md', buildRalphClaudeTemplate());
    await writeIfMissing('scripts/ralph/ralph.sh', buildRalphShellTemplate());
  }
}

async function createFrontendScaffold(
  spec: InitSpec,
  mkdir: (relativePath: string) => Promise<void>,
  writeIfMissing: (relativePath: string, content: string) => Promise<void>
): Promise<void> {
  await mkdir('docs/04-frontend');
  await mkdir('docs/04-frontend/design');
  await mkdir('docs/04-frontend/components');
  await mkdir('docs/04-frontend/testing');

  for (const stack of spec.frontendStacks) {
    if (stack === 'react') {
      const dirs = [
        'frontend/react/src/app',
        'frontend/react/src/pages',
        'frontend/react/src/components',
        'frontend/react/src/features',
        'frontend/react/src/hooks',
        'frontend/react/src/services',
        'frontend/react/src/state',
        'frontend/react/src/styles',
        'frontend/react/src/types',
        'frontend/react/src/utils',
        'frontend/react/src/tests',
        'frontend/react/e2e'
      ];
      for (const dir of dirs) await mkdir(dir);
      await writeIfMissing('frontend/react/README.md', frontendReadme('React / TypeScript', ['@product-dev /frontend', '@product-dev /journey', '@product-dev /api', '@product-dev /test']));
      await writeIfMissing('frontend/react/package.json', JSON.stringify({
        scripts: { dev: 'vite', build: 'vite build', test: 'vitest run', lint: 'eslint src --ext ts,tsx' },
        dependencies: {},
        devDependencies: {}
      }, null, 2));
      await writeIfMissing('.github/instructions/frontend-react.instructions.md', stackInstruction('Frontend React', 'React + TypeScript UI code, component boundaries, hooks, state, accessibility, and tests.'));
    } else if (stack === 'vue') {
      await mkdir('frontend/vue/src');
      await mkdir('frontend/vue/tests');
      await writeIfMissing('frontend/vue/README.md', frontendReadme('Vue / TypeScript', ['@product-dev /frontend', '@product-dev /journey']));
      await writeIfMissing('.github/instructions/frontend-vue.instructions.md', stackInstruction('Frontend Vue', 'Vue + TypeScript UI code, components, composables, state, accessibility, and tests.'));
    } else if (stack === 'angular') {
      await mkdir('frontend/angular/src/app');
      await mkdir('frontend/angular/src/environments');
      await writeIfMissing('frontend/angular/README.md', frontendReadme('Angular / TypeScript', ['@product-dev /frontend', '@product-dev /journey']));
      await writeIfMissing('.github/instructions/frontend-angular.instructions.md', stackInstruction('Frontend Angular', 'Angular modules/components/services, routing, RxJS, forms, accessibility, and tests.'));
    } else {
      await mkdir('frontend/_decision-required');
      await writeIfMissing('frontend/_decision-required/README.md', `# Frontend Stack Decision Required\n\nPlease choose a frontend stack before generating implementation folders.\n\nExamples:\n\n\`@product-dev /init frontend react\`\n\`@product-dev /init frontend vue\`\n\`@product-dev /init frontend angular\`\n`);
    }
  }

  await writeIfMissing('DESIGN.md', designMdStarterTemplate(spec));
  await writeIfMissing('docs/04-frontend/design/DESIGN.md', designMdStarterTemplate(spec));
  await writeIfMissing('docs/04-frontend/frontend-brief.md', frontendBriefTemplate(spec));
}

async function createBackendScaffold(
  spec: InitSpec,
  mkdir: (relativePath: string) => Promise<void>,
  writeIfMissing: (relativePath: string, content: string) => Promise<void>
): Promise<void> {
  await mkdir('docs/05-backend');
  await mkdir('docs/05-backend/security');
  await mkdir('docs/05-backend/testing');

  for (const stack of spec.backendStacks) {
    if (stack === 'springboot') {
      const dirs = [
        'backend/java-springboot/src/main/java/com/company/product/api',
        'backend/java-springboot/src/main/java/com/company/product/application',
        'backend/java-springboot/src/main/java/com/company/product/domain',
        'backend/java-springboot/src/main/java/com/company/product/infrastructure',
        'backend/java-springboot/src/main/java/com/company/product/config',
        'backend/java-springboot/src/main/resources',
        'backend/java-springboot/src/test/java/com/company/product',
        'docs/05-backend/springboot'
      ];
      for (const dir of dirs) await mkdir(dir);
      await writeIfMissing('backend/java-springboot/README.md', backendReadme('Java Spring Boot', ['@product-dev /springboot', '@product-dev /api', '@product-dev /review']));
      await writeIfMissing('backend/java-springboot/pom.xml', springBootPomTemplate());
      await writeIfMissing('backend/java-springboot/src/main/resources/application.yml', 'spring:\n  application:\n    name: product-service\n\nserver:\n  port: 8080\n');
      await writeIfMissing('.github/instructions/backend-springboot.instructions.md', stackInstruction('Backend Spring Boot', 'Layered Spring Boot code: Controller, DTO, validation, service, repository, security, transactions, observability, tests.'));
    } else if (stack === 'python-fastapi' || stack === 'python-generic') {
      const dirs = [
        'backend/python-fastapi/app/api',
        'backend/python-fastapi/app/core',
        'backend/python-fastapi/app/models',
        'backend/python-fastapi/app/schemas',
        'backend/python-fastapi/app/services',
        'backend/python-fastapi/app/repositories',
        'backend/python-fastapi/tests',
        'docs/05-backend/python'
      ];
      for (const dir of dirs) await mkdir(dir);
      await writeIfMissing('backend/python-fastapi/README.md', backendReadme('Python FastAPI', ['@product-dev /python', '@product-dev /api', '@product-dev /review']));
      await writeIfMissing('backend/python-fastapi/pyproject.toml', pythonPyprojectTemplate('fastapi'));
      await writeIfMissing('backend/python-fastapi/app/main.py', 'from fastapi import FastAPI\n\napp = FastAPI(title="Product Service")\n\n@app.get("/health")\ndef health():\n    return {"status": "ok"}\n');
      await writeIfMissing('.github/instructions/backend-python.instructions.md', stackInstruction('Backend Python', 'Python service code: FastAPI/Flask, Pydantic, repository/service layers, pytest, migrations, logging, and runtime commands.'));
    } else if (stack === 'python-flask') {
      const dirs = [
        'backend/python-flask/app/routes',
        'backend/python-flask/app/services',
        'backend/python-flask/app/repositories',
        'backend/python-flask/tests',
        'docs/05-backend/python'
      ];
      for (const dir of dirs) await mkdir(dir);
      await writeIfMissing('backend/python-flask/README.md', backendReadme('Python Flask', ['@product-dev /python', '@product-dev /api', '@product-dev /review']));
      await writeIfMissing('backend/python-flask/pyproject.toml', pythonPyprojectTemplate('flask'));
    } else if (stack === 'node') {
      await mkdir('backend/node/src');
      await mkdir('backend/node/tests');
      await writeIfMissing('backend/node/README.md', backendReadme('Node backend', ['@product-dev /backend', '@product-dev /api', '@product-dev /review']));
    } else if (stack === 'go') {
      await mkdir('backend/go/cmd');
      await mkdir('backend/go/internal');
      await writeIfMissing('backend/go/README.md', backendReadme('Go backend', ['@product-dev /backend', '@product-dev /api', '@product-dev /review']));
    } else {
      await mkdir('backend/_decision-required');
      await writeIfMissing('backend/_decision-required/README.md', `# Backend Stack Decision Required\n\nPlease choose a backend stack before generating implementation folders.\n\nExamples:\n\n\`@product-dev /init backend java springboot\`\n\`@product-dev /init backend python fastapi\`\n\`@product-dev /init backend python flask\`\n`);
    }
  }

  await writeIfMissing('docs/05-backend/backend-brief.md', backendBriefTemplate(spec));
}

async function createDataScaffold(
  spec: InitSpec,
  mkdir: (relativePath: string) => Promise<void>,
  writeIfMissing: (relativePath: string, content: string) => Promise<void>
): Promise<void> {
  const commonDirs = [
    'data/contracts',
    'data/sttm',
    'data/dbschema',
    'data/pipelines',
    'data/dq',
    'data/reconciliation',
    'data/lineage',
    'data/privacy',
    'data/catalog',
    'data/semantic',
    'data/migration',
    'data/runbook',
    'docs/06-data/contracts',
    'docs/06-data/sttm',
    'docs/06-data/dq',
    'docs/06-data/reconciliation',
    'docs/06-data/lineage',
    'docs/06-data/pipeline',
    'docs/06-data/privacy',
    'docs/06-data/catalog',
    'docs/06-data/semantic',
    'docs/06-data/cost',
    'docs/09-runbook/data'
  ];
  for (const dir of commonDirs) await mkdir(dir);

  for (const engine of spec.dataEngines) {
    if (engine === 'decision-required') {
      await mkdir('data/sql/_decision-required');
      await writeIfMissing('data/sql/_decision-required/README.md', `# Data Engine Decision Required\n\nPlease choose the target engine(s) before creating engine-specific SQL folders.\n\nExamples:\n\n\`@product-dev /init data postgresql\`\n\`@product-dev /init data oracle maxcompute\`\n\`@product-dev /init fullstack react springboot postgresql\`\n`);
    } else {
      await mkdir(`data/sql/${engine}`);
      await writeIfMissing(`data/sql/${engine}/README.md`, dataEngineReadme(engine));
      await writeIfMissing(`.github/instructions/data-${engine}.instructions.md`, stackInstruction(`Data ${engine}`, `SQL and data engineering work for ${engine}: dialect rules, partitioning/indexing, DQ, reconciliation, lineage, privacy, and cost controls.`));
    }
  }

  await writeIfMissing('data/README.md', dataReadme(spec));
  await writeIfMissing('data/contracts/data-contract.template.yaml', dataContractTemplate());
  await writeIfMissing('data/sttm/sttm.template.csv', 'source_system,source_table,source_column,target_table,target_column,transformation_rule,join_rule,dq_rule,owner\n');
  await writeIfMissing('data/dq/dq-rules.template.yaml', dqTemplate());
  await writeIfMissing('data/reconciliation/reconciliation.template.sql', reconciliationTemplate());
  await writeIfMissing('data/lineage/lineage.template.mmd', 'flowchart LR\n  source_table --> target_table\n');
}

function buildQuestionnaire(spec: InitSpec): string {
  const sections: string[] = [
`# Project Background Questionnaire\n\nAnswer what you know. Leave unknown items blank; \`@product-dev\` will mark assumptions explicitly.\n\n## 0. Technology Stack Confirmation\n\nDetected tracks: ${spec.tracks.join(', ') || 'TBD'}\nDetected frontend stacks: ${spec.frontendStacks.join(', ') || 'TBD'}\nDetected backend stacks: ${spec.backendStacks.join(', ') || 'TBD'}\nDetected data engines: ${spec.dataEngines.join(', ') || 'TBD'}\nDetected AI tooling: ${spec.agentTooling.join(', ') || 'TBD'}\n\n${spec.missingDecisions.length ? `### Missing decisions\n\n${spec.missingDecisions.map(d => `- ${d}`).join('\n')}\n\nPlease answer these first, then rerun \`@product-dev /init <explicit stack>\`.\n` : 'No missing stack decisions detected.\n'}\n\n## 1. Business Context\n\n1. What business problem are we solving?\n2. Who are the target users?\n3. What is the expected business value?\n4. What market / region / legal entity does this apply to?\n5. Is this customer-facing, internal, regulatory, operational, or analytics/reporting?\n6. What is the business criticality: low / medium / high / critical?\n7. What is the target release window?\n8. What are the non-negotiable constraints?\n\n## 2. Governance Context\n\n1. Who is product owner?\n2. Who is tech owner?\n3. Who is data owner?\n4. Who approves release?\n5. Which standards apply: security, architecture, data governance, privacy, compliance?\n6. What audit evidence must be retained?\n`
  ];

  if (spec.tracks.includes('frontend')) {
    sections.push(`## 3. Frontend Context\n\n1. Framework: ${spec.frontendStacks.join(' / ')}?\n2. UI library: Material UI / Ant Design / Tailwind / internal design system?\n3. Target users and roles?\n4. Key pages and user flows?\n5. Required UX states: loading, empty, error, permission denied, success?\n6. API dependencies?\n7. Browser support requirements?\n8. Accessibility requirements?\n9. Analytics / telemetry requirements?\n10. Performance targets?\n`);
  }

  if (spec.tracks.includes('backend')) {
    sections.push(`## 4. Backend Context\n\n1. Backend stack: ${spec.backendStacks.join(' / ')}?\n2. Domain entities?\n3. APIs to expose?\n4. Authentication and authorization model?\n5. Transaction boundaries?\n6. Idempotency requirements?\n7. Error code standard?\n8. Logging and observability requirements?\n9. Upstream/downstream systems?\n10. Deployment runtime?\n`);
  }

  if (spec.tracks.includes('data')) {
    sections.push(`## 5. Data Engineering Context\n\n1. Source systems and source tables?\n2. Target tables / data products?\n3. Database engines: ${spec.dataEngines.join(' / ')}?\n4. Batch, streaming, or hybrid?\n5. Refresh frequency and SLA?\n6. Partition strategy?\n7. Primary keys / business keys?\n8. Data grain?\n9. Incremental watermark?\n10. Backfill window?\n11. Reconciliation requirements?\n12. Data quality thresholds?\n13. Sensitive fields and masking requirements?\n14. Data retention requirements?\n15. Lineage / catalog tools?\n16. Scheduler: Airflow / DolphinScheduler / Control-M / DataWorks / other?\n17. Downstream consumers?\n18. Incident escalation path?\n`);
  }

  sections.push(`## 6. Next Action\n\nAfter answering, run:\n\n\`\`\`text\n@product-dev /context paste my answers and update project profile\n\`\`\`\n\nThen run:\n\n\`\`\`text\n@product-dev /plan\n\`\`\`\n`);
  return sections.join('\n');
}

function buildProjectProfileTemplate(spec: InitSpec): string {
  return `project:\n  name: current-project\n  domain: unknown\n  type: ${spec.tracks.join('+') || 'TBD'}\n  businessCriticality: medium\n  region: unknown\n  releaseWindow: unknown\n\nowners:\n  productOwner: TBD\n  techOwner: TBD\n  dataOwner: TBD\n  securityReviewer: TBD\n  releaseApprover: TBD\n\ntracks:\n${spec.tracks.length ? spec.tracks.map(t => `  ${t}: true`).join('\n') : '  TBD: true'}\n\nfrontend:\n  stacks: [${spec.frontendStacks.map(s => `"${s}"`).join(', ')}]\n  uiLibrary: TBD\n  stateManagement: TBD\n  telemetry: TBD\n\nbackend:\n  stacks: [${spec.backendStacks.map(s => `"${s}"`).join(', ')}]\n  authModel: TBD\n  runtime: TBD\n\ndata:\n  engines: [${spec.dataEngines.map(e => `"${e}"`).join(', ')}]\n  sourceSystems: []\n  targetDatasets: []\n  refreshFrequency: TBD\n  sla: TBD\n  scheduler: TBD\n  dqRequired: true\n  reconciliationRequired: true\n  lineageRequired: true\n  privacyReviewRequired: true\n\nagentTooling:\n  copilot: ${spec.agentTooling.includes('copilot')}\n  opencode: ${spec.agentTooling.includes('opencode')}\n\ngovernance:\n  apiContractRequired: true\n  dataContractRequired: ${spec.tracks.includes('data')}\n  auditEvidenceRequired: true\n  releaseRunbookRequired: true\n`;
}

function buildProductDevConfig(spec: InitSpec): string {
  return `outputRoot: docs\nmaxContextFiles: 80\nwriteArtifacts: true\nproject:\n  name: current-project\n  domain: banking-data-platform\n  type: ${spec.tracks.join('+') || 'TBD'}\n  businessCriticality: high\nworkflow:\n  mode: ordered\n  nextStepHints: true\n  interactiveIntake: true\ninit:\n  stackDriven: true\n  frontendStacks:\n${spec.frontendStacks.map(s => `    - ${s}`).join('\n') || '    - TBD'}\n  backendStacks:\n${spec.backendStacks.map(s => `    - ${s}`).join('\n') || '    - TBD'}\n  dataEngines:\n${spec.dataEngines.map(e => `    - ${e}`).join('\n') || '    - TBD'}\nagentTooling:\n  copilot: ${spec.agentTooling.includes('copilot')}\n  opencode: ${spec.agentTooling.includes('opencode')}\npolicyPacks:\n  enabled: true\n  root: .product-dev/policy-packs\n  precedence:\n    - global\n    - company\n    - department\n    - country\n    - project\n    - environment\nralphLoop:\n  maxIterations: 8\n  mode: guided\ntracks:\n${spec.tracks.map(t => `  ${t}: true`).join('\n') || '  TBD: true'}\nqualityGates:\n  maxFileLines: 1000\n  maxFunctionLines: 200\n  maxComplexity: 15\n  requireTests: true\n  requireApiContract: true\n  requireDataContract: ${spec.tracks.includes('data')}\n  requireDQ: ${spec.tracks.includes('data')}\n  requireReconciliation: ${spec.tracks.includes('data')}\n  requireLineage: ${spec.tracks.includes('data')}\n  requireRunbook: true\nstandards:\n  coding: policies/coding-standard.yaml\n  security: policies/security-standard.yaml\n  api: policies/api-standard.yaml\n  data: policies/data-standard.yaml\n  privacy: policies/privacy-standard.yaml\n`;
}

function renderInitReport(
  spec: InitSpec,
  dirs: string[],
  files: string[],
  questionFile: string,
  profileFile: string,
  sessionFile: string
): string {
  const missing = spec.missingDecisions.length ? `\n## Missing Decisions\n\n${spec.missingDecisions.map(d => `- ${d}`).join('\n')}\n\nRerun init with explicit stack names after answering, for example:\n\n\`@product-dev /init fullstack react springboot postgresql\`\n` : '';
  return `# Product Dev Copilot Initialized\n\n## Stack-driven result\n\n- Tracks: ${spec.tracks.join(', ') || 'TBD'}\n- Frontend stacks: ${spec.frontendStacks.join(', ') || 'none'}\n- Backend stacks: ${spec.backendStacks.join(', ') || 'none'}\n- Data engines: ${spec.dataEngines.join(', ') || 'none'}\n- Agent tooling: ${spec.agentTooling.join(', ')}\n\n${missing}\n## Created directories\n\n${dirs.map(d => `- \`${d}\``).join('\n')}\n\n## Created files\n\n${files.length ? files.map(f => `- \`${f}\``).join('\n') : '- No new files were needed; existing files were preserved.'}\n\n## AI IDE assets\n\nThe initializer created only the relevant Copilot/opencode files requested or implied by the prompt.\n\n- Copilot: \`.github/copilot-instructions.md\`, \`.github/instructions/*.instructions.md\`, \`.github/prompts/*.prompt.md\`\n- opencode: \`AGENTS.md\`, \`.opencode/opencode.jsonc\`, \`.opencode/agents/*.md\`, \`.opencode/commands/*.md\`\n\n## Local Policy Packs\n\nI also created \`.product-dev/policy-packs/\` so your company, department, country, project, and environment-specific rules can override generic defaults.\n\nRecommended flow:\n\n1. Edit the generated files under \`.product-dev/policy-packs/\`.\n2. Run \`@product-dev /policy-scan\`.\n3. Run \`@product-dev /policy-review\`.\n\n## Interactive intake\n\nI created a project questionnaire:\n\n- \`${questionFile}\`\n\nI also created a structured project profile template:\n\n- \`${profileFile}\`\n\nLocal initialization state:\n\n- \`${sessionFile}\`\n\n## How to continue\n\n1. Fill \`${questionFile}\`, or paste answers directly into chat.\n2. Run \`@product-dev /context <your answers>\` to capture background knowledge.\n3. Run \`@product-dev /plan\` to generate the ordered workflow.\n\n## Suggested next command\n\n\`${spec.ambiguous ? '@product-dev /intake' : '@product-dev /policy-intake'}\`\n`;
}

function normalize(input: string): string {
  return ` ${input.toLowerCase().replace(/[\-_]/g, ' ')} `;
}

function hasAny(text: string, needles: string[]): boolean {
  return needles.some(n => text.includes(n));
}

function frontendReadme(stack: string, commands: string[]): string {
  return `# ${stack} Frontend Track\n\nThis folder was generated because the /init prompt explicitly selected ${stack}.\n\n## Suggested commands\n\n${commands.map(c => `- \`${c}\``).join('\n')}\n`;
}

function backendReadme(stack: string, commands: string[]): string {
  return `# ${stack} Backend Track\n\nThis folder was generated because the /init prompt explicitly selected ${stack}.\n\n## Suggested commands\n\n${commands.map(c => `- \`${c}\``).join('\n')}\n`;
}

function dataEngineReadme(engine: DataEngine): string {
  return `# ${engine} SQL Workspace\n\nUse this folder for ${engine}-specific SQL, DDL, validation SQL, DQ checks, reconciliation SQL, and migration scripts.\n\nDo not place SQL for unrelated engines in this folder.\n`;
}

function frontendBriefTemplate(spec: InitSpec): string {
  return `# Frontend Brief\n\n## Selected frontend stacks\n\n${spec.frontendStacks.map(s => `- ${s}`).join('\n')}\n\n## Pages\n\n## Components\n\n## API dependencies\n\n## State model\n\n## UX states\n\n- Loading:\n- Empty:\n- Error:\n- Permission denied:\n- Success:\n\n## Telemetry\n\n## Accessibility\n\n## Performance risks\n`;
}

function backendBriefTemplate(spec: InitSpec): string {
  return `# Backend Brief\n\n## Selected backend stacks\n\n${spec.backendStacks.map(s => `- ${s}`).join('\n')}\n\n## Domain services\n\n## API boundaries\n\n## Transactions\n\n## Security and permissions\n\n## Observability\n\n## Error handling\n\n## Testing strategy\n`;
}

function dataReadme(spec: InitSpec): string {
  return `# Data Engineering Track\n\nSelected engines: ${spec.dataEngines.join(', ')}\n\nBank-grade data development workspace.\n\n## Recommended sequence\n\n1. \`@product-dev /data\`\n2. \`@product-dev /datacontract\`\n3. \`@product-dev /sttm\`\n4. \`@product-dev /dbschema\`\n5. \`@product-dev /sql\`\n6. \`@product-dev /dq\`\n7. \`@product-dev /reconcile\`\n8. \`@product-dev /lineage\`\n9. \`@product-dev /pipeline\`\n10. \`@product-dev /scheduler\`\n11. \`@product-dev /data-test\`\n12. \`@product-dev /privacy\`\n13. \`@product-dev /data-review\`\n14. \`@product-dev /release\`\n15. \`@product-dev /runbook\`\n`;
}

function buildCopilotInstructions(spec: InitSpec): string {
  return `# GitHub Copilot Repository Instructions\n\n## Project tracks\n\n${spec.tracks.map(t => `- ${t}`).join('\n') || '- TBD'}\n\n## Technology stacks\n\n- Frontend: ${spec.frontendStacks.join(', ') || 'TBD'}\n- Backend: ${spec.backendStacks.join(', ') || 'TBD'}\n- Data engines: ${spec.dataEngines.join(', ') || 'TBD'}\n\n## Mandatory behavior\n\n1. Follow the selected stack only. Do not generate Java code in a Python-only backend project, and do not generate Python code in a Java-only backend project.\n2. Read \`.product-dev/config.yaml\`, \`docs/context/project-profile.yaml\`, and \`.product-dev/policy-packs/\` before proposing implementation.\n3. Prefer small, reviewable changes.\n4. Include tests or a test plan for every implementation change.\n5. For data work, always check grain, join cardinality, DQ, reconciliation, lineage, privacy, and runbook impact.\n6. Do not hard-code company, department, country, or environment policy; use Policy Pack files.
7. Read .product-dev/skills/ and apply relevant local skills when they match the task.\n`;
}

function buildCopilotPromptFile(spec: InitSpec): string {
  return `# Product Dev Workflow Prompt\n\nUse this prompt when asking Copilot to execute product development workflow tasks.\n\n## Context files to read first\n\n- AGENTS.md\n- .github/copilot-instructions.md\n- docs/context/project-profile.yaml\n- .product-dev/config.yaml\n- .product-dev/policy-packs/**
- .product-dev/prompts/**
- agent-resources/prompts/**
- agent-resources/skills/**\n\n## Task\n\nExecute the requested change using only the selected stack:\n\n- Frontend: ${spec.frontendStacks.join(', ') || 'TBD'}\n- Backend: ${spec.backendStacks.join(', ') || 'TBD'}\n- Data engines: ${spec.dataEngines.join(', ') || 'TBD'}\n\n## Output\n\n1. Assumptions\n2. Files changed\n3. Implementation steps\n4. Tests\n5. Risks\n6. Next command suggestion\n`;
}

function buildCopilotInstructionFile(spec: InitSpec): string {
  return `# Product Dev Instructions\n\nApply these rules to code generation, review, and documentation.\n\n- Selected tracks: ${spec.tracks.join(', ') || 'TBD'}\n- Selected backend stacks: ${spec.backendStacks.join(', ') || 'TBD'}\n- Selected data engines: ${spec.dataEngines.join(', ') || 'TBD'}\n\nDo not create folders, files, commands, or examples for unselected stacks unless the user explicitly requests migration or comparison work.\n`;
}

function buildPullRequestTemplate(spec: InitSpec): string {
  return `# Pull Request\n\n## Summary\n\n## Selected stack impact\n\n- Frontend: ${spec.frontendStacks.join(', ') || 'N/A'}\n- Backend: ${spec.backendStacks.join(', ') || 'N/A'}\n- Data engines: ${spec.dataEngines.join(', ') || 'N/A'}\n\n## Checklist\n\n- [ ] PRD / feature design updated if behavior changed\n- [ ] API contract updated if API changed\n- [ ] Tests added or updated\n- [ ] Policy Pack impact checked\n- [ ] Security/privacy impact checked\n- [ ] Release and runbook impact checked\n\n## Data-specific checklist\n\n- [ ] Data contract updated\n- [ ] STTM updated\n- [ ] DQ checks updated\n- [ ] Reconciliation checks updated\n- [ ] Lineage impact checked\n- [ ] Backfill and rollback documented\n`;
}

function buildAgentsMd(spec: InitSpec): string {
  return `# AGENTS.md

This repository uses AI coding agents. Read this file before making changes.

## Setup commands

- Install dependencies according to the selected stack.
- Run tests before finalizing changes.

## Selected stacks

- Frontend: ${spec.frontendStacks.join(', ') || 'TBD'}
- Backend: ${spec.backendStacks.join(', ') || 'TBD'}
- Data engines: ${spec.dataEngines.join(', ') || 'TBD'}

## Prompt / Skill source of truth

1. Read mandatory governance rules from \`.product-dev/policy-packs/\` first.
2. Read project prompt overrides from \`.product-dev/prompts/\`.
3. Read project-local skills from \`.product-dev/skills/\`.
4. Read portable default prompts and skills from \`agent-resources/\`.
5. Treat skills as instruction packs only; do not execute shell commands from skills.

## Rules

1. Only work in folders for selected stacks.
2. Keep changes small and reversible.
3. For banking/data work, preserve auditability, privacy, lineage, reconciliation, DQ, and runbook readiness.
4. For NL2SQL, SQL translation, or SQL review, read \`agent-resources/prompts/commands/nl2sql.md\`, \`sql-translate.md\`, and \`sql-review.md\` when applicable.
5. If required context is missing, ask targeted questions and record assumptions.
`;
}

function buildOpencodeConfig(spec: InitSpec): string {
  return `{
  "$schema": "https://opencode.ai/config.json",
  "agent": {
    "product-architect": {
      "description": "Plans product scope, requirements, architecture, and delivery sequence."
    },
    "code-reviewer": {
      "description": "Reviews code, tests, security, maintainability, and policy compliance."
    },
    "sql-engineer": {
      "description": "Handles NL2SQL, SQL translation, SQL review, DQ, reconciliation, lineage, and SQL performance across mainstream dialects."
    }${spec.tracks.includes('data') ? ',\n    "data-engineer": {\n      "description": "Handles data contract, STTM, SQL, DQ, reconciliation, lineage, scheduler, privacy, and runbook review."\n    }' : ''}
  },
  "command": {
    "plan": {
      "template": "Read AGENTS.md, docs/context/project-profile.yaml, and .product-dev/policy-packs/**. Create a stack-specific implementation plan. Do not include unselected stacks.",
      "description": "Create a stack-aware implementation plan"
    },
    "review": {
      "template": "Review the current changes against selected stack rules, project profile, and policy packs. Return blocker/high/medium/low findings.",
      "description": "Review changes against project rules"
    },
    "loop-next": {
      "template": "Read .product-dev/ralph-loop.local.json and continue only the next pending small task. Update TODO/status files after completion.",
      "description": "Continue next Ralph loop task"
    },
    "design-md": {
      "template": "Read agent-resources/prompts/commands/design-md.md and agent-resources/skills/design-md/SKILL.md. Generate or update root DESIGN.md.",
      "description": "Generate or update DESIGN.md"
    },
    "nl2sql": {
      "template": "Read agent-resources/prompts/commands/nl2sql.md and convert the business question into safe dialect-aware SQL.",
      "description": "Convert natural language to SQL"
    },
    "sql-translate": {
      "template": "Read agent-resources/prompts/commands/sql-translate.md and translate SQL across requested dialects.",
      "description": "Translate SQL dialects"
    },
    "sql-review": {
      "template": "Read agent-resources/prompts/commands/sql-review.md and review SQL for production readiness.",
      "description": "Review SQL"
    }
  }
}\n`;
}

function buildOpencodeAgent(name: string, description: string): string {
  return `---\ndescription: ${description}\n---\n\n# ${name}\n\n## Operating rules\n\n1. Read AGENTS.md first.\n2. Read docs/context/project-profile.yaml.\n3. Read .product-dev/config.yaml and policy packs.\n4. Work only on the selected technology stack unless asked otherwise.\n5. Produce small, reviewable changes with tests or validation steps.\n`;
}

function buildOpencodeCommand(name: string, description: string): string {
  return `# ${name}\n\n${description}\n\n## Required context\n\n- AGENTS.md\n- docs/context/project-profile.yaml\n- .product-dev/config.yaml\n- .product-dev/policy-packs/**
- .product-dev/prompts/**
- agent-resources/prompts/**
- agent-resources/skills/**\n\n## Output format\n\n1. Assumptions\n2. Action taken\n3. Files changed\n4. Validation\n5. Next step\n`;
}

function stackInstruction(title: string, scope: string): string {
  return `# ${title} Instructions\n\nScope: ${scope}\n\n## Rules\n\n- Follow project profile and Policy Pack files.\n- Do not generate unrelated technology stack files.\n- Keep changes small and testable.\n- Explain assumptions and missing context.\n`;
}

function buildAgentDeliveryRules(spec: InitSpec): string {
  return `# AI Delivery Rules\n\n## Selected tracks\n\n${spec.tracks.map(t => `- ${t}`).join('\n') || '- TBD'}\n\n## Selected stacks\n\n- Frontend: ${spec.frontendStacks.join(', ') || 'TBD'}\n- Backend: ${spec.backendStacks.join(', ') || 'TBD'}\n- Data engines: ${spec.dataEngines.join(', ') || 'TBD'}\n\n## Rule\n\nThe initializer is stack-driven. Do not create or modify unselected stack folders unless the user explicitly asks for migration, comparison, or multi-stack generation.\n`;
}

function springBootPomTemplate(): string {
  return `<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">\n  <modelVersion>4.0.0</modelVersion>\n  <groupId>com.company</groupId>\n  <artifactId>product-service</artifactId>\n  <version>0.1.0-SNAPSHOT</version>\n  <properties>\n    <java.version>21</java.version>\n  </properties>\n</project>\n`;
}

function pythonPyprojectTemplate(framework: 'fastapi' | 'flask'): string {
  return `[project]\nname = "product-service"\nversion = "0.1.0"\nrequires-python = ">=3.11"\ndependencies = [\n  "${framework}",\n  "pytest"\n]\n`;
}

function dataContractTemplate(): string {
  return `dataset: TBD\nowner: TBD\nsla: TBD\ngrain: TBD\nprimaryKey: []\npartition: TBD\nfields:\n  - name: TBD\n    type: TBD\n    nullable: true\n    businessDefinition: TBD\n    sensitivity: internal\n    dqRules: []\ncompatibility:\n  breakingChanges:\n    - delete_field\n    - rename_field\n    - change_type\n    - nullable_to_not_null\n    - enum_value_removed\n`;
}

function dqTemplate(): string {
  return `rules:\n  - name: completeness_check\n    dimension: completeness\n    severity: high\n    sql: TBD\n    threshold: \">= 99.5%\"\n    owner: TBD\n`;
}

function reconciliationTemplate(): string {
  return `-- Reconciliation template\n-- Replace table names and business keys.\n\nselect\n  'count_check' as check_name,\n  src.cnt as source_count,\n  tgt.cnt as target_count,\n  src.cnt - tgt.cnt as diff_count\nfrom (select count(*) cnt from source_table where business_date = :business_date) src\ncross join (select count(*) cnt from target_table where business_date = :business_date) tgt;\n`;
}

function designMdStarterTemplate(spec: InitSpec): string {
  return `# DESIGN.md

## 1. Visual Theme & Atmosphere

Initial placeholder created by /init. Run \`@product-dev /design-md\` after adding or scanning frontend code to extract the real design system.

- Product/domain: ${spec.tracks.join(', ') || 'TBD'}
- Frontend stack: ${spec.frontendStacks.join(', ') || 'TBD'}
- Design maturity: draft

## 2. Color Palette & Roles

| Token | Value | Role | Evidence |
|---|---|---|---|
| TBD | TBD | Primary / surface / text / status | Run /design-md |

## 3. Typography Rules

| Role | Font | Size | Weight | Line Height | Evidence |
|---|---|---:|---:|---:|---|
| TBD | TBD | TBD | TBD | TBD | Run /design-md |

## 4. Component Stylings

Document buttons, cards, forms, navigation, tables, dialogs, charts, alerts, loading, empty, and error states.

## 5. Layout Principles

Document grid, spacing scale, page width, navigation layout, and whitespace rules.

## 6. Depth & Elevation

Document surface hierarchy, shadows, overlays, modals, and z-index rules.

## 7. Do's and Don'ts

- Do use repository-backed tokens when available.
- Do not invent exact color/font tokens without code or user evidence.

## 8. Responsive Behavior

Document breakpoints, collapse strategy, touch targets, and mobile navigation.

## 9. Agent Prompt Guide

When generating UI, read this DESIGN.md first and follow the token, component, layout, and accessibility rules. If a rule is missing, ask or mark the output as a recommendation.

## 10. Source Evidence and Assumptions

- Source evidence: pending repository scan.
- Assumptions: this file is an initialization placeholder.

## 11. Next Command

Run \`@product-dev /design-md\` to extract a real DESIGN.md from the frontend project.
`;
}

function buildRalphProgressTemplate(): string {
  return '# Ralph Progress\n\n## Codebase Patterns\n\n- Add reusable patterns, conventions, and gotchas here.\n\n## Iteration Log\n\n';
}

function buildRalphPrdJsonExample(): string {
  return JSON.stringify({
    project: 'MyApp',
    branchName: 'ralph/example-feature',
    description: 'Example feature prepared for Ralph-style execution',
    userStories: [
      {
        id: 'US-001',
        title: 'Add example schema field',
        description: 'As a developer, I need the schema field so that later stories can persist data.',
        acceptanceCriteria: ['Schema change is added', 'Migration or DDL validation passes', 'Typecheck passes'],
        priority: 1,
        passes: false,
        notes: ''
      }
    ]
  }, null, 2) + '\n';
}

function buildRalphPromptTemplate(): string {
  return '# Ralph Agent Instructions\n\n' +
    'You are an autonomous coding agent working on exactly one user story per iteration.\n\n' +
    '## Task\n\n' +
    '1. Read scripts/ralph/prd.json.\n' +
    '2. Read scripts/ralph/progress.txt, especially Codebase Patterns.\n' +
    '3. Check the branch from branchName.\n' +
    '4. Pick the highest-priority story where passes:false.\n' +
    '5. Implement only that story.\n' +
    '6. Run the project required quality checks.\n' +
    '7. Update AGENTS.md with genuinely reusable patterns only.\n' +
    '8. If checks pass, update that story to passes:true and append progress.\n' +
    '9. If all stories pass, respond COMPLETE.\n\n' +
    '## Quality requirements\n\n' +
    'Do not commit or mark a story complete unless validation evidence passes. Frontend stories require browser or manual visual verification. Data stories require DQ or reconciliation validation.\n';
}

function buildRalphClaudeTemplate(): string {
  return '# Ralph Agent Instructions for Claude / OpenCode-compatible Agents\n\nFollow scripts/ralph/prompt.md. Store durable memory in prd.json, progress.txt, and AGENTS.md/CLAUDE.md, not in chat context.\n';
}

function buildRalphShellTemplate(): string {
  return '#!/usr/bin/env bash\n' +
    'set -euo pipefail\n' +
    'TOOL="${1:-opencode}"\n' +
    'MAX_ITERATIONS="${2:-10}"\n' +
    'for i in $(seq 1 "$MAX_ITERATIONS"); do\n' +
    '  echo "Ralph iteration $i/$MAX_ITERATIONS using $TOOL"\n' +
    '  case "$TOOL" in\n' +
    '    opencode) opencode run < scripts/ralph/prompt.md ;;\n' +
    '    claude) claude -p "$(cat scripts/ralph/CLAUDE.md)" ;;\n' +
    '    amp) amp < scripts/ralph/prompt.md ;;\n' +
    '    *) echo "Unsupported tool: $TOOL"; exit 1 ;;\n' +
    '  esac\n' +
    '  if grep -q "\\\"passes\\\": false" scripts/ralph/prd.json 2>/dev/null; then continue; fi\n' +
    '  echo "COMPLETE"\n' +
    '  exit 0\n' +
    'done\n';
}
