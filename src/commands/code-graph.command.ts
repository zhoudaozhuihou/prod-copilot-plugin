/**
 * Command handler for @code-graph.
 *
 * GitNexus-inspired code intelligence command. Uses the standard AI artifact pipeline,
 * so user input optimization, attachment context, Policy Packs, custom skills,
 * portable prompts, and subagent guidance are all applied before model invocation.
 */

import { runAiArtifactCommand, streamResult } from './shared';
import { CommandArgs } from '../core/types';

export async function runCodeGraphCommand(args: CommandArgs): Promise<void> {
  const result = await runAiArtifactCommand(args, 'code-graph');
  streamResult(args, result);
}
