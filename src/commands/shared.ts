import * as fs from 'fs/promises';
import * as path from 'path';
import { generateWithLanguageModel } from '../ai/language-model';
import { scanBackendApiSignals } from '../backend/api-code-scanner';
import { CommandArgs, CommandResult, PromptPackage } from '../core/types';
import { renderRequestContext } from '../context/request-context';
import { artifactPathFor, getNextStepHint } from '../workflow/workflow';
import { getCodeContext } from '../code-index/indexer';

const SYSTEM_PROMPT = `You are a bank-grade AI SDLC assistant embedded in VS Code Copilot.
Work as a precise product, engineering, test, and data-development consultant.
Always preserve user constraints, project evidence, policy packs, security, auditability, privacy, traceability, rollback, and testability.

# Behavioral Guidelines (Karpathy Style)
1. **Think Before Coding**: Don't assume. Don't hide confusion. Surface tradeoffs. State assumptions explicitly. If multiple interpretations exist, present them.
2. **Simplicity First**: Minimum code that solves the problem. Nothing speculative. No features beyond what was asked. No abstractions for single-use code.
3. **Surgical Changes**: Touch only what you must. Clean up only your own mess. Don't refactor things that aren't broken. Match existing style. Every changed line should trace directly to the user's request.
4. **Goal-Driven Execution**: Define success criteria. Loop until verified. Transform tasks into verifiable goals.

For complex tasks, recommend subagent delegation when useful, but keep the main output consolidated and actionable.`;

const DEFAULT_CONSTRAINTS = [
  'Do not invent repository facts. Label assumptions clearly.',
  'Use project policy packs, custom skills, attachments, and active editor context when available.',
  'For backend API test generation, derive endpoints and request shapes from Controller/router, DTO/model, validation, security, exception, and service logic evidence.',
  'For banking systems, include negative cases, authorization cases, audit/logging expectations, data privacy risks, and production-safe validation.'
];

export async function runAiArtifactCommand(args: CommandArgs, command = args.command): Promise<CommandResult> {
  const title = titleFor(command);
  const outputPath = artifactPathFor(command);
  const workspaceRoot = args.requestContext?.workspaceRoot;
  const extraContext: string[] = [];

  if (isBackendApiTestCommand(command)) {
    const scan = scanBackendApiSignals(workspaceRoot);
    extraContext.push(scan.markdown);
    await writeWorkspaceFile(workspaceRoot, 'docs/test/backend-api-code-scan.md', scan.markdown);
  }

  const promptPackage = await buildPromptPackage(args, command, title, extraContext.join('\n\n'));
  const content = await generateWithLanguageModel(promptPackage, args.request, args.token);
  await writeWorkspaceFile(workspaceRoot, outputPath, content);

  return {
    title,
    artifactPath: outputPath,
    content,
    nextCommand: getNextStepHint(command)
  };
}

export function streamResult(args: CommandArgs, result: CommandResult): void {
  args.stream.markdown(result.content);
  if (result.artifactPath) {
    args.stream.markdown(`\n\n---\n\n📄 **Artifact written:** \`${result.artifactPath}\``);
  }
  if (result.nextCommand) {
    args.stream.markdown(`\n\n➡️ **Next:** ${result.nextCommand}`);
  }
}

export async function runLocalInfoCommand(args: CommandArgs, command = args.command): Promise<CommandResult> {
  const content = localInfo(command, args);
  const result = { title: titleFor(command), content, nextCommand: getNextStepHint(command) };
  streamResult(args, result);
  return result;
}

async function buildPromptPackage(args: CommandArgs, command: string, title: string, extraContext: string): Promise<PromptPackage> {
  const commandPrompt = await readOptionalResource(args.requestContext?.workspaceRoot, [
    `.product-dev/prompts/commands/${command}.md`,
    `agent-resources/prompts/commands/${command}.md`,
    `prompts/commands/${command}.md`
  ]);
  const outputSchema = await readOptionalResource(args.requestContext?.workspaceRoot, [
    `.product-dev/prompts/output-schemas/${command}.md`,
    `agent-resources/prompts/output-schemas/${command}.md`
  ]) || defaultOutputSchema(command);
  const skills = await loadRelevantSkills(args.requestContext?.workspaceRoot, command);
  const codeIndex = args.requestContext?.workspaceRoot
    ? getCodeContext(args.requestContext.workspaceRoot)
    : null;
  const context = [
    codeIndex ? `## Codebase Structural Index\n${codeIndex.summary}` : '',
    `## Raw User Input\n${args.userPrompt || '(empty)'}`,
    `## Optimized User Intent\n${optimizeUserInput(command, args.userPrompt)}`,
    `## Request Context\n${renderRequestContext(args.requestContext)}`,
    extraContext ? `## Backend Code Scan / Static Evidence\n${extraContext}` : '',
    skills ? `## Loaded Skills\n${skills}` : ''
  ].filter(Boolean).join('\n\n');

  return {
    title,
    systemPrompt: SYSTEM_PROMPT,
    role: roleFor(command),
    task: commandPrompt || defaultTask(command),
    workflowStage: command,
    context,
    constraints: DEFAULT_CONSTRAINTS,
    outputSchema,
    nextStepHint: getNextStepHint(command)
  };
}

function optimizeUserInput(command: string, raw: string): string {
  const prompt = raw?.trim() || 'No explicit user prompt was provided; infer from command and repository context.';
  return [
    `Command: /${command}`,
    `Primary goal: ${goalFor(command)}`,
    `User request: ${prompt}`,
    'Preserve explicit stack, database, framework, policy, country, department, and output-format constraints.',
    'If critical background is missing, include a short Targeted Questions section before implementation details.'
  ].join('\n');
}

function isBackendApiTestCommand(command: string): boolean {
  return ['api-test-gen', 'springboot-api-tests', 'python-api-tests', 'backend-api-scan'].includes(command);
}

function roleFor(command: string): string {
  if (['api-test-gen', 'springboot-api-tests'].includes(command)) return 'Senior Java Spring Boot API test architect and QA automation engineer';
  if (command === 'python-api-tests') return 'Senior Python backend API test architect and pytest/FastAPI QA engineer';
  if (command.includes('sql')) return 'Senior data engineer and SQL reviewer';
  if (command.includes('requirements')) return 'Senior business analyst and product manager';
  return 'Senior enterprise software delivery architect';
}

function goalFor(command: string): string {
  const goals: Record<string, string> = {
    'api-test-gen': 'Read backend code logic and generate executable API test request examples and automated test cases.',
    'springboot-api-tests': 'Generate Spring Boot API test requests, MockMvc/RestAssured/JUnit tests, and negative/security test scenarios.',
    'python-api-tests': 'Generate FastAPI/Flask API test requests, pytest/httpx tests, and negative/security test scenarios.',
    'backend-api-scan': 'Scan backend code and summarize API endpoint evidence for test generation.'
  };
  return goals[command] ?? 'Generate a high-quality enterprise SDLC artifact.';
}

function defaultTask(command: string): string {
  if (command === 'api-test-gen') {
    return `Read backend source code, attached files, and active editor context. Identify API endpoints, request/response shapes, validation rules, authorization constraints, exception paths, service logic branches, and generate API request examples plus automated tests.`;
  }
  if (command === 'springboot-api-tests') {
    return `For Java Spring Boot code, derive tests from @RestController/@RequestMapping methods, DTO validation annotations, @PreAuthorize/security annotations, @ControllerAdvice, service branches, and repository/data effects. Generate .http/cURL/Postman examples plus MockMvc or RestAssured JUnit 5 tests.`;
  }
  if (command === 'python-api-tests') {
    return `For Python FastAPI/Flask code, derive tests from route decorators, Pydantic schemas, dependencies/security, exception handlers, service branches, and data effects. Generate .http/cURL/Postman examples plus pytest/httpx tests.`;
  }
  if (command === 'backend-api-scan') {
    return `Scan backend code and summarize API endpoint evidence. Do not invent missing request fields.`;
  }
  return `Execute @product-dev /${command} using the user request, repository evidence, attachments, policy packs, skills, and output schema.`;
}

function defaultOutputSchema(command: string): string {
  if (['api-test-gen', 'springboot-api-tests', 'python-api-tests'].includes(command)) {
    return `# Backend API Test Generation Output
## 1. Evidence Summary
- Scanned controllers/routes
- DTO/request model evidence
- Validation and security evidence
- Service logic branches and assumptions

## 2. Endpoint Test Matrix
| ID | Method | Path | Scenario | Request Data | Expected Status | Expected Assertions | Source Evidence |

## 3. Request Examples
### VS Code .http
### cURL
### HTTPie
### Postman Collection JSON Snippet
### Insomnia Request YAML/JSON

## 4. Positive Test Cases
## 5. Negative / Boundary Test Cases
## 6. Auth / Permission Test Cases
## 7. Validation Error Test Cases
## 8. Service Logic / Business Rule Test Cases
## 9. Persistence / Data Side-Effect Checks
## 10. Automation Code
- Spring Boot: MockMvc / RestAssured / JUnit 5
- Python: pytest / httpx / TestClient

## 11. Test Data Builder
## 12. CI Integration
## 13. Gaps and Questions
## 14. Next Command`;
  }
  if (command === 'backend-api-scan') {
    return `# Backend API Scan Report
## Endpoint Signals
## DTO / Request Model Signals
## Validation / Security Signals
## Service Logic Signals
## Missing Evidence
## Recommended Next Command`;
  }
  return `# ${titleFor(command)}
## Summary
## Inputs Used
## Main Artifact
## Risks / Assumptions
## Verification
## Next Command`;
}

async function readOptionalResource(root: string | undefined, relativePaths: string[]): Promise<string> {
  if (!root) return '';
  for (const rel of relativePaths) {
    try {
      const p = path.join(root, rel);
      const stat = await fs.stat(p);
      if (stat.isFile() && stat.size < 200_000) return await fs.readFile(p, 'utf8');
    } catch {
      // keep searching
    }
  }
  return '';
}

/**
 * Parse YAML-style frontmatter from a SKILL.md string.
 * Returns key-value pairs from the frontmatter block (--- ... ---).
 */
function parseSkillFrontmatter(text: string): Record<string, string> {
  const fm: Record<string, string> = {};
  const match = text.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return fm;
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx < 0) continue;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    fm[key] = val;
  }
  return fm;
}

/**
 * Normalize a command string for matching against skill metadata.
 */
function normalizeForMatch(s: string): string {
  return s.replace(/[-_]/g, '').toLowerCase();
}

async function loadRelevantSkills(root: string | undefined, command: string): Promise<string> {
  if (!root) return '';
  const bases = ['.product-dev/skills', 'agent-resources/skills'];
  const chunks: string[] = [];
  const cmdNorm = normalizeForMatch(command);

  for (const base of bases) {
    try {
      const dir = path.join(root, base);
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const e of entries) {
        if (!e.isDirectory()) continue;
        const p = path.join(dir, e.name, 'SKILL.md');
        const text = await fs.readFile(p, 'utf8').catch(() => '');
        if (!text) continue;

        // Parse frontmatter for structured matching
        const fm = parseSkillFrontmatter(text);
        const skillName = normalizeForMatch(fm['name'] || '');
        const appliesTo = normalizeForMatch(fm['appliesTo'] || '');
        const triggers = normalizeForMatch(fm['triggers'] || '');
        const desc = normalizeForMatch(fm['description'] || '');

        // Match against frontmatter fields: name, appliesTo, triggers, description
        const matched =
          skillName.includes(cmdNorm) ||
          appliesTo.includes(cmdNorm) ||
          triggers.includes(cmdNorm) ||
          desc.includes(cmdNorm) ||
          // Fallback: include skills that explicitly declare broad applicability
          appliesTo.includes('all');

        if (matched) {
          chunks.push(`### ${e.name}\n${text.slice(0, 7000)}`);
        }
      }
    } catch {
      // optional
    }
  }
  return chunks.join('\n\n');
}

async function writeWorkspaceFile(root: string | undefined, rel: string, content: string): Promise<void> {
  if (!root) return;
  const p = path.join(root, rel);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, content, 'utf8');
}

function localInfo(command: string, args: CommandArgs): string {
  if (command === 'attachments') {
    return `# Attachment Context\n\n${renderRequestContext(args.requestContext)}`;
  }
  if (command === 'backend-api-scan') {
    return scanBackendApiSignals(args.requestContext?.workspaceRoot).markdown;
  }
  return `# /${command}\n\nNo local-only implementation is required. Use /plan or a model-backed command.`;
}

function titleFor(command: string): string {
  return command.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}
