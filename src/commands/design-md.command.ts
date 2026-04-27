/**
 * Product Dev Copilot Source Note
 *
 * File: src/commands/design-md.command.ts
 * Purpose: Generate a Stitch-compatible DESIGN.md from existing frontend code or user-supplied design intent.
 *
 * Usage rules:
 * - Read the current frontend repository context before generating a design system.
 * - Produce a root-level DESIGN.md so Copilot/OpenCode/Stitch-style tools can consume it directly.
 * - Also write the normal docs artifact for review and versioned documentation.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { runAiArtifactCommand, streamResult } from './shared';
import { CommandArgs } from '../core/types';
import { getWorkspaceRoot } from '../context/workspace';

export async function runDesignMdCommand(args: CommandArgs): Promise<void> {
  const result = await runAiArtifactCommand(args, args.command === 'ui-design' ? 'ui-design' : 'design-md');
  const workspaceRoot = getWorkspaceRoot();
  const designMdPath = path.join(workspaceRoot, 'DESIGN.md');
  await fs.writeFile(designMdPath, normalizeDesignMd(result.markdown), 'utf8');
  result.markdown = result.markdown + '\n\n---\n\n## Root Artifact\n\n✅ Root DESIGN.md written: `' + designMdPath + '`';
  streamResult(args, result);
}

function normalizeDesignMd(markdown: string): string {
  const trimmed = markdown.trim();
  if (/^#\s+DESIGN\.md/im.test(trimmed) || /^#\s+Design System/im.test(trimmed)) {
    return `${trimmed}\n`;
  }
  return `# DESIGN.md\n\n${trimmed}\n`;
}
