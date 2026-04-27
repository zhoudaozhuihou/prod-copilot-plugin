/**
 * Product Dev Copilot Source Note
 *
 * File: src/core/types.ts
 * Purpose: Shared domain types for commands, prompts, repository context, policy packs, and results.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import * as vscode from 'vscode';
import { RequestContext } from '../context/request-context';

export type ProductDevCommand =
  | 'help'
  | 'init'
  | 'scan'
  | 'intake'
  | 'context'
  | 'attachments'
  | 'policy-init'
  | 'policy-intake'
  | 'policy-scan'
  | 'policy-review'
  | 'skill-init'
  | 'skill-scan'
  | 'skill-run'
  | 'skill-review'
  | 'resources-scan'
  | 'resources-init'
  | 'agents-init'
  | 'agents-scan'
  | 'datacontract'
  | 'sttm'
  | 'dq'
  | 'reconcile'
  | 'lineage'
  | 'sql-translate'
  | 'sql-review'
  | 'nl2sql'
  | 'migration'
  | 'scheduler'
  | 'privacy'
  | 'data-test'
  | 'data-review'
  | 'catalog'
  | 'semantic'
  | 'cost'
  | 'runbook'
  | 'plan'
  | 'loop'
  | 'loop-next'
  | 'loop-status'
  | 'loop-stop'
  | 'prompt'
  | 'summarize'
  | 'compress'
  | 'doc-review'
  | 'rewrite'
  | 'checklist'
  | 'brainstorm'
  | 'feature'
  | 'prd'
  | 'story-split'
  | 'prd-json'
  | 'ralph-readiness'
  | 'journey'
  | 'design-md'
  | 'ui-design'
  | 'architecture-diagram'
  | 'journey-diagram'
  | 'diagram'
  | 'code-wiki'
  | 'impact-analysis'
  | 'code-graph'
  | 'frontend'
  | 'backend'
  | 'springboot'
  | 'python'
  | 'data'
  | 'sql'
  | 'dbschema'
  | 'pipeline'
  | 'quality'
  | 'task'
  | 'api'
  | 'review'
  | 'test'
  | 'diff'
  | 'release';

export interface CommandArgs {
  command: ProductDevCommand;
  userPrompt: string;
  extensionContext: vscode.ExtensionContext;
  chatContext: vscode.ChatContext;
  stream: vscode.ChatResponseStream;
  token: vscode.CancellationToken;
  request: vscode.ChatRequest;
  /** Raw prompt enriched context collected from VS Code Chat references, attachments, and active editor. */
  requestContext?: RequestContext;
}

export interface RepoFileSummary {
  path: string;
  language: string;
  size: number;
  excerpt: string;
}

export interface RepoContext {
  workspaceRoot: string;
  repoName: string;
  techStack: string[];
  packageInfo?: string;
  routeHints: string[];
  apiHints: string[];
  databaseHints: string[];
  frontendHints: string[];
  backendHints: string[];
  dataPipelineHints: string[];
  sourceFiles: RepoFileSummary[];
  policyPacks: PolicyPackContext;
  config: ProductDevConfig;
}

export interface GitContext {
  branch?: string;
  status?: string;
  diff?: string;
  lastCommit?: string;
}

export interface PolicyPackFile {
  path: string;
  layer: string;
  category: string;
  size: number;
  excerpt: string;
}

export interface PolicyPackContext {
  enabled: boolean;
  root: string;
  precedence: string[];
  files: PolicyPackFile[];
  missingRecommendedFiles: string[];
  warnings: string[];
}

export interface ProductDevConfig {
  outputRoot: string;
  maxContextFiles: number;
  writeArtifacts: boolean;
  project?: {
    name?: string;
    domain?: string;
    type?: string;
    businessCriticality?: string;
  };
  qualityGates?: {
    maxFileLines?: number;
    maxFunctionLines?: number;
    maxComplexity?: number;
    requireTests?: boolean;
    requireApiContract?: boolean;
    requireReleaseChecklist?: boolean;
  };
  standards?: Record<string, string>;
  policyPacks?: {
    enabled?: boolean;
    root?: string;
    precedence?: string[];
    requiredFiles?: string[];
  };
  integrations?: Record<string, unknown>;
}

export interface PromptPackage {
  title: string;
  systemPrompt: string;
  role: string;
  task: string;
  context: string;
  constraints: string[];
  outputSchema: string;
  artifactPath: string;
  workflowStage: string;
  nextStepHint: string;
}

export interface CommandResult {
  title: string;
  markdown: string;
  artifactPath?: string;
  nextStepHint?: string;
}

export interface RalphLoopState {
  active: boolean;
  task: string;
  createdAt: string;
  updatedAt: string;
  iteration: number;
  maxIterations: number;
  mode: 'guided' | 'auto';
  status: 'active' | 'paused' | 'completed' | 'stopped';
  sequence: ProductDevCommand[];
  completed: ProductDevCommand[];
  currentCommand?: ProductDevCommand;
  nextCommand?: ProductDevCommand;
  completionCriteria: string[];
  notes: string[];
}
