/**
 * Product Dev Copilot Source Note
 *
 * File: src/commands/context.command.ts
 * Purpose: Command handler for @context. Delegates to the shared AI artifact pipeline or performs local workflow actions.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { CommandArgs } from '../core/types';
import { getWorkspaceRoot } from '../context/workspace';
import { ensureDir } from '../utils/fs-utils';

export async function runContextCommand(args: CommandArgs): Promise<void> {
  const root = getWorkspaceRoot();
  const now = new Date().toISOString();
  const contextDir = path.join(root, 'docs/context');
  await ensureDir(contextDir);

  const userAnswersPath = path.join(contextDir, 'user-background.md');
  const profilePatchPath = path.join(contextDir, 'project-profile.patch.md');
  const sessionPath = path.join(root, '.product-dev/init-session.local.json');

  const content = `# User Background Answers

Captured at: ${now}

## Raw answers

${args.userPrompt || '_No answers were provided. Run `@product-dev /intake` to see questions._'}

## Extraction guidance for next commands

When generating artifacts, treat these answers as project-specific background knowledge. If important fields are missing, mark them as TBD and ask follow-up questions in the "Open Questions" section.
`;

  await fs.writeFile(userAnswersPath, content, 'utf8');
  await fs.writeFile(profilePatchPath, buildProfilePatch(args.userPrompt, now), 'utf8');
  await fs.writeFile(sessionPath, JSON.stringify({
    active: true,
    stage: 'context-captured',
    updatedAt: now,
    nextCommand: 'plan',
    capturedContextFile: 'docs/context/user-background.md'
  }, null, 2), 'utf8');

  args.stream.markdown(`# Project Context Captured

Saved your answers to:

- \`docs/context/user-background.md\`
- \`docs/context/project-profile.patch.md\`

## Suggested next command

\`@product-dev /plan\`

This will use your background plus repo context to decide whether the workflow should emphasize frontend, backend, data engineering, or fullstack delivery.
`);
}

function buildProfilePatch(raw: string, now: string): string {
  return `# Project Profile Patch

Captured at: ${now}

## Suggested manual updates

Update \`docs/context/project-profile.yaml\` with the facts below.

## Raw source

${raw || '_No raw answers provided._'}

## Missing items to verify

- Product owner
- Tech owner
- Data owner
- Business criticality
- Release window
- Frontend stack
- Backend stack
- Database engines
- Source systems
- Target datasets
- DQ thresholds
- Reconciliation rules
- Privacy and masking requirements
- Runbook owner
`;
}
