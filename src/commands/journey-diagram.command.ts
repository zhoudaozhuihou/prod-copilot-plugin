/**
 * Command handler for @journey-diagram.
 *
 * Produces diagram-as-code artifacts in Markdown, primarily Mermaid diagrams.
 * The shared pipeline still applies prompt optimization, attachment context,
 * policy packs, skills, and subagent guidance before model invocation.
 */

import { runAiArtifactCommand, streamResult } from './shared';
import { CommandArgs } from '../core/types';

export async function runJourneyDiagramCommand(args: CommandArgs): Promise<void> {
  const result = await runAiArtifactCommand(args, 'journey-diagram');
  streamResult(args, result);
}
