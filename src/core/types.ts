import * as vscode from 'vscode';
import { RequestContext } from '../context/request-context';

export type ProductDevCommand = string;

/**
 * Supported SQL dialects for lineage parsing, SQL translation, and NL2SQL.
 * Enum values match common configuration key conventions.
 */
export enum SqlDialect {
  PostgreSQL = 'postgresql',
  Oracle = 'oracle',
  BigQuery = 'bigquery',
  MaxCompute = 'maxcompute',
  MySQL = 'mysql',
  SQLServer = 'sqlserver',
  Snowflake = 'snowflake',
  Databricks = 'databricks',
  Hive = 'hive',
}

/**
 * Human-readable labels for each SQL dialect.
 */
export const SQL_DIALECT_LABELS: Record<SqlDialect, string> = {
  [SqlDialect.PostgreSQL]: 'PostgreSQL',
  [SqlDialect.Oracle]: 'Oracle',
  [SqlDialect.BigQuery]: 'BigQuery',
  [SqlDialect.MaxCompute]: 'MaxCompute / ODPS',
  [SqlDialect.MySQL]: 'MySQL',
  [SqlDialect.SQLServer]: 'SQL Server',
  [SqlDialect.Snowflake]: 'Snowflake',
  [SqlDialect.Databricks]: 'Databricks / Spark SQL',
  [SqlDialect.Hive]: 'Hive',
};

export interface CommandArgs {
  command: ProductDevCommand;
  userPrompt: string;
  extensionContext: vscode.ExtensionContext;
  chatContext: vscode.ChatContext;
  stream: vscode.ChatResponseStream;
  token: vscode.CancellationToken;
  request: vscode.ChatRequest;
  requestContext?: RequestContext;
}

export interface CommandResult {
  title: string;
  artifactPath?: string;
  content: string;
  nextCommand?: string;
  warnings?: string[];
}

export interface PromptPackage {
  title: string;
  systemPrompt: string;
  role: string;
  task: string;
  workflowStage: string;
  context: string;
  constraints: string[];
  outputSchema: string;
  nextStepHint: string;
}
