/**
 * Portable AI resource loader.
 *
 * Purpose:
 * - Keep prompts, output schemas, and skills outside TypeScript source code where possible.
 * - Make the same resources consumable by VS Code Copilot today and OpenCode later.
 * - Allow project teams to override extension defaults by placing Markdown files under
 *   `.product-dev/prompts/` or `agent-resources/`.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ProductDevCommand } from '../core/types';
import { exists } from '../utils/fs-utils';

export async function loadPortablePromptContext(workspaceRoot: string, command: ProductDevCommand): Promise<string> {
  const candidates = [
    ['Project command prompt', `.product-dev/prompts/commands/${command}.md`],
    ['Project system prompt', '.product-dev/prompts/system/base.md'],
    ['Project output schema', `.product-dev/prompts/output-schemas/${command}.md`],
    ['Portable command prompt', `agent-resources/prompts/commands/${command}.md`],
    ['Portable system prompt', 'agent-resources/prompts/system/base.md'],
    ['Portable output schema', `agent-resources/prompts/output-schemas/${command}.md`],
  ];

  const sections: string[] = [];
  for (const [label, relativePath] of candidates) {
    const absolute = path.join(workspaceRoot, relativePath);
    if (await exists(absolute)) {
      const content = await fs.readFile(absolute, 'utf8');
      sections.push(`### ${label}: ${relativePath}\n\n${truncate(content, 5000)}`);
    }
  }

  if (!sections.length) {
    return '## Portable Prompt Resources\n\n- No project-level portable prompt resources found. Run `@product-dev /resources-init` to create `.product-dev/prompts/` and `agent-resources/`.';
  }
  return `## Portable Prompt Resources\n\n${sections.join('\n\n')}`;
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}\n\n...[truncated portable prompt resource]` : value;
}
