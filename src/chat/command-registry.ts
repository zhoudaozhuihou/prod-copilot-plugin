import * as vscode from 'vscode';

const USAGE_STATS_KEY = 'product_dev_command_usage_stats';

/**
 * Safe logging helper — avoids importing logger.ts (which depends on vscode OutputChannel)
 * so that unit tests importing command-registry.ts don't fail on the vscode dependency.
 */
function logWarn(message: string, error?: unknown): void {
  try {
    const { logError } = require('../utils/logger');
    logError(message, error);
  } catch {
    console.warn(message, error);
  }
}

// Map exposed prefixed commands to internal workflow filenames/identifiers
export const COMMAND_ALIASES: Record<string, string> = {
  'dev-frontend': 'frontend',
  'dev-backend': 'backend',
  'dev-springboot': 'springboot',
  'dev-python': 'python',
  'dev-data': 'data',
  'dev-sql': 'sql',
  'dev-dbschema': 'dbschema',
  'dev-pipeline': 'pipeline',
  'dev-api': 'api',
  'test-plan': 'test',
  'test-api-gen': 'api-test-gen',
  'test-springboot-api': 'springboot-api-tests',
  'test-python-api': 'python-api-tests',
  'test-data': 'data-test',
  'debug-review': 'review',
  'debug-doc': 'doc-review',
  'debug-sql': 'sql-review',
  'debug-data': 'data-review',
  'debug-impact': 'impact-analysis'
};

// Reverse mapping for recommendations
export const INTERNAL_TO_EXPOSED: Record<string, string> = Object.entries(COMMAND_ALIASES).reduce((acc, [exposed, internal]) => {
  acc[internal] = exposed;
  return acc;
}, {} as Record<string, string>);

export function getExposedCommand(internalCommand: string): string {
  return INTERNAL_TO_EXPOSED[internalCommand] || internalCommand;
}

export function getInternalCommand(exposedCommand: string): string {
  return COMMAND_ALIASES[exposedCommand] || exposedCommand;
}

// Track command usage frequency
export function recordCommandUsage(context: vscode.ExtensionContext, exposedCommand: string): void {
  try {
    const stats = context.globalState.get<Record<string, number>>(USAGE_STATS_KEY) || {};
    stats[exposedCommand] = (stats[exposedCommand] || 0) + 1;
    context.globalState.update(USAGE_STATS_KEY, stats);
  } catch (e) {
    logWarn('Failed to record command usage', e);
  }
}

export function getCommandUsageStats(context: vscode.ExtensionContext): Record<string, number> {
  try {
    return context.globalState.get<Record<string, number>>(USAGE_STATS_KEY) || {};
  } catch {
    return {};
  }
}

export function getCommandUsage(context: vscode.ExtensionContext, exposedCommand: string): number {
  return getCommandUsageStats(context)[exposedCommand] || 0;
}

// Fuzzy search for commands based on natural language input
export function fuzzyMatchCommand(prompt: string): string | undefined {
  const p = prompt.toLowerCase();

  // Check for test-related intent FIRST, before general 'data' check
  // to support phrases like '测试数据' mapping to test-data instead of dev-data
  if (p.includes('测试') || p.includes('test')) {
    if (p.includes('api') || p.includes('接口')) return 'test-api-gen';
    if (p.includes('数据') || p.includes('data')) return 'test-data';
    return 'test-plan';
  }

  if (p.includes('前端') || p.includes('frontend')) return 'dev-frontend';
  if (p.includes('后端') || p.includes('backend')) return 'dev-backend';
  if (p.includes('springboot') || p.includes('spring boot') || p.includes('java')) return 'dev-springboot';
  if (p.includes('python') || p.includes('fastapi')) return 'dev-python';
  if (p.includes('数据') || p.includes('data')) return 'dev-data';
  if (p.includes('建表') || p.includes('schema')) return 'dev-dbschema';
  if (p.includes('审查') || p.includes('review')) {
    if (p.includes('代码') || p.includes('code')) return 'debug-review';
    if (p.includes('文档') || p.includes('doc')) return 'debug-doc';
    if (p.includes('sql')) return 'debug-sql';
    if (p.includes('数据') || p.includes('data')) return 'debug-data';
  }
  if (p.includes('总结') || p.includes('summarize')) return 'summarize';
  if (p.includes('计划') || p.includes('plan')) return 'plan';

  return undefined;
}
