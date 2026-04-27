/**
 * Command handler for @architecture-diagram.
 *
 * Produces diagram-as-code artifacts in Markdown, primarily Mermaid diagrams.
 * The shared pipeline still applies prompt optimization, attachment context,
 * policy packs, skills, and subagent guidance before model invocation.
 */

import { runAiArtifactCommand, streamResult } from './shared';
import { CommandArgs } from '../core/types';

export async function runArchitectureDiagramCommand(args: CommandArgs): Promise<void> {
  const result = await runAiArtifactCommand(args, 'architecture-diagram');
  streamResult(args, result);
}
