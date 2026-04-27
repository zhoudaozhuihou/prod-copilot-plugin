/**
 * Product Dev Copilot Source Note
 *
 * File: src/loop/ralph-loop.ts
 * Purpose: Ralph-style loop state manager. Stores iterative task progress outside the chat context.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ProductDevCommand, RalphLoopState } from '../core/types';
import { getWorkspaceRoot } from '../context/workspace';
import { ensureDir, exists } from '../utils/fs-utils';
import { selectLoopSequence } from '../workflow/workflow';

export function loopStatePath(root = getWorkspaceRoot()): string {
  return path.join(root, '.product-dev', 'ralph-loop.local.json');
}

export function loopTodoPath(root = getWorkspaceRoot()): string {
  return path.join(root, '.product-dev', 'RALPH_LOOP_TODO.md');
}

export async function createLoopState(task: string, maxIterations: number, mode: 'guided' | 'auto'): Promise<RalphLoopState> {
  const root = getWorkspaceRoot();
  await ensureDir(path.join(root, '.product-dev'));
  const sequence = selectLoopSequence(task);
  const now = new Date().toISOString();
  const state: RalphLoopState = {
    active: true,
    task,
    createdAt: now,
    updatedAt: now,
    iteration: 0,
    maxIterations,
    mode,
    status: 'active',
    sequence,
    completed: [],
    nextCommand: sequence[0],
    completionCriteria: defaultCompletionCriteria(),
    notes: ['Loop created. Each iteration writes an artifact, updates state, and recommends the next step.']
  };
  await saveLoopState(state);
  return state;
}

export async function loadLoopState(): Promise<RalphLoopState | undefined> {
  const file = loopStatePath();
  if (!(await exists(file))) return undefined;
  const raw = await fs.readFile(file, 'utf8');
  return JSON.parse(raw) as RalphLoopState;
}

export async function saveLoopState(state: RalphLoopState): Promise<void> {
  state.updatedAt = new Date().toISOString();
  await fs.writeFile(loopStatePath(), JSON.stringify(state, null, 2), 'utf8');
  await fs.writeFile(loopTodoPath(), renderTodo(state), 'utf8');
}

export function getNextPendingCommand(state: RalphLoopState): ProductDevCommand | undefined {
  if (!state.active || state.status !== 'active') return undefined;
  if (state.iteration >= state.maxIterations) return undefined;
  return state.sequence.find(command => !state.completed.includes(command));
}

export async function markIterationComplete(state: RalphLoopState, command: ProductDevCommand, note: string): Promise<RalphLoopState> {
  if (!state.completed.includes(command)) state.completed.push(command);
  state.iteration += 1;
  state.currentCommand = command;
  state.nextCommand = getNextPendingCommand(state);
  state.notes.push(`[${new Date().toISOString()}] /${command}: ${note}`);
  if (!state.nextCommand) {
    state.active = false;
    state.status = state.iteration >= state.maxIterations ? 'paused' : 'completed';
    if (state.status === 'paused') state.notes.push('Paused because maxIterations was reached. Increase max iterations or run /loop-next after review.');
  }
  await saveLoopState(state);
  return state;
}

export async function stopLoopState(reason = 'Stopped by user command.'): Promise<RalphLoopState | undefined> {
  const state = await loadLoopState();
  if (!state) return undefined;
  state.active = false;
  state.status = 'stopped';
  state.notes.push(`[${new Date().toISOString()}] ${reason}`);
  await saveLoopState(state);
  return state;
}

export function renderLoopStatus(state: RalphLoopState): string {
  const next = getNextPendingCommand(state);
  const rows = state.sequence.map((command, index) => {
    const marker = state.completed.includes(command) ? '✅ Done' : command === next ? '➡️ Next' : '⏳ Pending';
    return `| ${index + 1} | \`/${command}\` | ${marker} |`;
  }).join('\n');
  return `# Ralph Loop Status\n\n` +
    `- **Status**: ${state.status}\n` +
    `- **Task**: ${state.task}\n` +
    `- **Iteration**: ${state.iteration}/${state.maxIterations}\n` +
    `- **Mode**: ${state.mode}\n` +
    `- **Next command**: ${next ? `\`@product-dev /${next}\`` : 'None'}\n\n` +
    `## Sequence\n\n| # | Command | State |\n|---:|---|---|\n${rows}\n\n` +
    `## Completion Criteria\n\n${state.completionCriteria.map(c => `- [ ] ${c}`).join('\n')}\n\n` +
    `## Notes\n\n${state.notes.slice(-8).map(n => `- ${n}`).join('\n')}\n`;
}

function renderTodo(state: RalphLoopState): string {
  const tasks = state.sequence.map(command => `- [${state.completed.includes(command) ? 'x' : ' '}] /${command}`).join('\n');
  return `# Ralph Loop TODO\n\nTask: ${state.task}\n\nIteration: ${state.iteration}/${state.maxIterations}\n\n## Command Sequence\n\n${tasks}\n\n## Completion Criteria\n\n${state.completionCriteria.map(c => `- [ ] ${c}`).join('\n')}\n\n## Completion Marker\n\nAdd \`ALL_TASKS_COMPLETE\` when implementation, tests, quality gates, review, diff, and release readiness are complete.\n`;
}

function defaultCompletionCriteria(): string[] {
  return [
    'A delivery plan exists and relevant tracks are selected.',
    'Product requirements and feature scope are explicit.',
    'Frontend/backend/data/API designs are generated when relevant.',
    'Implementation tasks have owners, dependencies, acceptance criteria, and priorities.',
    'Tests and quality gates cover product, engineering, security, data, and release readiness.',
    'Review, diff impact, release checklist, rollback, and monitoring are documented.'
  ];
}
