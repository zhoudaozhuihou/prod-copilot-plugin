/**
 * Product Dev Copilot Source Note
 *
 * File: src/commands/intake.command.ts
 * Purpose: Command handler for @intake. Delegates to the shared AI artifact pipeline or performs local workflow actions.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { CommandArgs, CommandResult } from '../core/types';
import { getWorkspaceRoot } from '../context/workspace';
import { ensureDir, exists } from '../utils/fs-utils';
import { detectInitTracks, initializeProjectScaffold } from '../scaffold/project-initializer';

export async function runIntakeCommand(args: CommandArgs): Promise<void> {
  const root = getWorkspaceRoot();
  const questionnaire = path.join(root, 'docs/00-intake/PROJECT_BACKGROUND_QUESTIONNAIRE.md');

  if (!(await exists(questionnaire))) {
    await initializeProjectScaffold(root, args.userPrompt);
  }

  const content = await fs.readFile(questionnaire, 'utf8');
  const tracks = detectInitTracks(args.userPrompt);
  const missingContext = buildMissingContextPrompt(tracks);

  const markdown = `# Interactive Intake

I found or created the project background questionnaire:

\`docs/00-intake/PROJECT_BACKGROUND_QUESTIONNAIRE.md\`

## Key questions to answer now

${missingContext}

## How to reply

Paste answers directly with:

\`\`\`text
@product-dev /context
Business problem: ...
Frontend: ...
Backend: ...
Data: ...
Governance: ...
\`\`\`

## Current questionnaire preview

${content.slice(0, 5000)}
`;

  const outputPath = path.join(root, 'docs/00-intake/intake-next-questions.md');
  await ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, markdown, 'utf8');

  args.stream.markdown(markdown);
}

function buildMissingContextPrompt(tracks: string[]): string {
  const questions = [
    '- What problem are we solving and who owns the business outcome?',
    '- What is the target release window and business criticality?',
    '- Which security, privacy, audit, and compliance rules apply?'
  ];
  if (tracks.includes('frontend')) {
    questions.push('- Frontend: what pages, user roles, UX states, design system, and telemetry are required?');
  }
  if (tracks.includes('backend')) {
    questions.push('- Backend: Java Spring Boot, Python, or both? What APIs, auth model, transaction boundaries, and runtime are required?');
  }
  if (tracks.includes('data')) {
    questions.push('- Data: what source systems, target tables, engines, SLA, DQ, reconciliation, lineage, scheduler, and masking rules are required?');
  }
  return questions.join('\n');
}
