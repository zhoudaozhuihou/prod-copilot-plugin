import * as vscode from 'vscode';
import { RequestContext } from '../context/request-context';

export type ProductDevCommand = string;

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
