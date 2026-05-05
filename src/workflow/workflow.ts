import * as vscode from 'vscode';
import { getCommandUsageStats, getExposedCommand } from '../chat/command-registry';

export const COMMAND_OUTPUTS: Record<string, string> = {
  'requirements': 'docs/01-requirements/requirements.md',
  'requirements-intake': 'docs/01-requirements/requirements-intake.md',
  'requirements-clarify': 'docs/01-requirements/requirements-clarify.md',
  'requirements-map': 'docs/01-requirements/requirements-map.md',
  'requirements-prioritize': 'docs/01-requirements/requirements-prioritize.md',
  'requirements-review': 'docs/01-requirements/requirements-review.md',
  'requirements-trace': 'docs/01-requirements/requirements-traceability-matrix.md',
  'prd': 'docs/prd/generated-prd.md',
  'feature': 'docs/01-product/feature-design.md',
  'journey': 'docs/journey/user-journey.md',
  'frontend': 'docs/frontend/frontend-design-and-implementation.md',
  'backend': 'docs/backend/backend-design.md',
  'springboot': 'docs/backend/springboot-implementation-plan.md',
  'python': 'docs/backend/python-implementation-plan.md',
  'api': 'docs/api/api-contract.md',
  'api-test-gen': 'docs/test/api-test-requests.md',
  'springboot-api-tests': 'docs/test/springboot-api-tests.md',
  'python-api-tests': 'docs/test/python-api-tests.md',
  'backend-api-scan': 'docs/test/backend-api-code-scan.md',
  'sql': 'docs/data/sql-design-and-optimization.md',
  'nl2sql': 'docs/data/nl2sql.md',
  'sql-review': 'docs/data/sql-review.md',
  'sql-translate': 'docs/data/sql-translate.md',
  'data': 'docs/data/data-development-plan.md',
  'dq': 'docs/data-quality/dq-rules.md',
  'reconcile': 'docs/reconciliation/reconciliation-plan.md',
  'lineage': 'docs/lineage/table-and-field-lineage.md',
  'pipeline': 'docs/data-pipeline/pipeline-design.md',
  'data-review': 'docs/review/data-review.md',
  'architecture-diagram': 'docs/diagrams/architecture-diagrams.md',
  'journey-diagram': 'docs/diagrams/user-journey-diagrams.md',
  'diagram': 'docs/diagrams/project-diagram-pack.md',
  'design-md': 'docs/frontend/DESIGN.md',
  'ui-design': 'docs/frontend/ui-design.md',
  'code-graph': 'docs/code-intelligence/code-graph-map.md',
  'impact-analysis': 'docs/code-intelligence/impact-analysis.md',
  'code-wiki': 'docs/code-intelligence/code-wiki.md',
  'review': 'docs/review/code-review-report.md',
  'test': 'docs/test/test-plan.md',
  'quality': 'docs/quality/quality-gates.md',
  'release': 'docs/release/release-notes-and-checklist.md',
  'runbook': 'docs/runbook/runbook.md',
  'prompt': 'docs/tools/prompt-optimization.md',
  'optimize-skill': 'docs/tools/optimized-skill.md',
  'optimize-agent': 'docs/tools/optimized-agent.md',
  'summarize': 'docs/tools/content-summary.md',
  'compress': 'docs/tools/context-compression.md',
  'doc-review': 'docs/tools/review-report.md',
  'rewrite': 'docs/tools/rewrite.md',
  'checklist': 'docs/tools/checklist.md'
};

const NEXT: Record<string, string> = {
  'init': 'scan',
  'scan': 'plan',
  'plan': 'requirements-intake',
  'requirements-intake': 'requirements-clarify',
  'requirements-clarify': 'requirements-map',
  'requirements-map': 'requirements-prioritize',
  'requirements-prioritize': 'requirements-review',
  'requirements-review': 'requirements-trace',
  'requirements-trace': 'feature',
  'feature': 'prd',
  'prd': 'story-split',
  'story-split': 'prd-json',
  'prd-json': 'ralph-readiness',
  'backend': 'api-test-gen',
  'springboot': 'springboot-api-tests',
  'python': 'python-api-tests',
  'api': 'api-test-gen',
  'api-test-gen': 'test',
  'springboot-api-tests': 'test',
  'python-api-tests': 'test',
  'test': 'quality',
  'quality': 'review',
  'review': 'release',
  'release': 'runbook',
  'sql': 'sql-review',
  'nl2sql': 'sql-review',
  'sql-review': 'dq',
  'dq': 'reconcile',
  'reconcile': 'lineage',
  'lineage': 'data-review',
  'architecture-diagram': 'diagram',
  'journey-diagram': 'frontend'
};

export function getNextCommand(command: string): string | undefined {
  return NEXT[command];
}

export function getNextStepHint(command: string): string {
  const next = getNextCommand(command);
  const exposed = next ? getExposedCommand(next) : 'plan';
  return `@product-dev /${exposed}`;
}

export function getSmartRecommendations(command: string, context: vscode.ExtensionContext): string[] {
  const recommendations = new Set<string>();
  
  // 1. Structural Next Step
  const next = getNextCommand(command);
  if (next) recommendations.add(getExposedCommand(next));
  
  // 2. Contextual additions based on the command domain
  if (['backend', 'springboot', 'python', 'api', 'backend-api-scan'].includes(command)) {
    recommendations.add(getExposedCommand('api-test-gen'));
  }
  if (['feature', 'prd', 'requirements-trace'].includes(command)) {
    recommendations.add(getExposedCommand('story-split'));
    recommendations.add(getExposedCommand('journey'));
  }
  if (['data', 'sql', 'dbschema'].includes(command)) {
    recommendations.add(getExposedCommand('sql-review'));
    recommendations.add(getExposedCommand('dq'));
  }
  
  // 3. Fallbacks
  if (recommendations.size < 3) {
    recommendations.add('plan');
    recommendations.add('summarize');
    recommendations.add('prompt');
  }

  // 4. Sort by historical usage frequency
  const stats = getCommandUsageStats(context);
  const result = Array.from(recommendations).sort((a, b) => {
    // Keep structural 'next' at the top regardless of frequency
    if (next && a === getExposedCommand(next)) return -1;
    if (next && b === getExposedCommand(next)) return 1;
    return (stats[b] || 0) - (stats[a] || 0);
  });
  
  return result.slice(0, 5); // Return top 3-5
}

export function renderToolCommandTable(): string {
  return `| Command | Purpose |\n|---|---|\n| /prompt | Optimize prompt |\n| /optimize-skill | Optimize custom skill prompt |\n| /optimize-agent | Optimize custom agent prompt |\n| /summarize | Summarize content |\n| /compress | Compress context |\n| /api-test-gen | Generate API request examples from backend code |\n| /sql-review | Review SQL |`;
}

export function renderWorkflowTable(): string {
  return `| Workflow | Commands |\n|---|---|\n| Requirements | /requirements-intake → /requirements-clarify → /requirements-map → /requirements-prioritize → /requirements-review → /requirements-trace |\n| Backend API testing | /backend-api-scan → /api-test-gen → /springboot-api-tests or /python-api-tests → /test → /quality |\n| Data SQL | /nl2sql → /sql-review → /dq → /reconcile → /lineage |`;
}

export function artifactPathFor(command: string): string {
  return COMMAND_OUTPUTS[command] ?? `docs/generated/${command}.md`;
}

/**
 * Workflow lane definitions for sequence diagram rendering.
 * Each lane is a labeled chain of command steps.
 */
const WORKFLOW_LANES: Record<string, string[]> = {
  'Requirements': ['requirements-intake', 'requirements-clarify', 'requirements-map', 'requirements-prioritize', 'requirements-review', 'requirements-trace'],
  'Product': ['feature', 'prd', 'story-split', 'prd-json', 'ralph-readiness'],
  'UI/Frontend': ['design-md', 'ui-design', 'frontend', 'journey'],
  'Backend API': ['backend-api-scan', 'api-test-gen', 'springboot-api-tests', 'test', 'quality'],
  'Data & SQL': ['nl2sql', 'sql-review', 'dq', 'reconcile', 'lineage', 'data-review'],
  'Delivery': ['review', 'release', 'runbook'],
  'Architecture': ['architecture-diagram', 'journey-diagram', 'diagram'],
};

/**
 * Render the full workflow as a Mermaid sequence diagram.
 * Shows step-by-step transitions between commands with lane grouping.
 */
export function renderWorkflowSequenceDiagram(): string {
  const lines: string[] = [];
  lines.push('```mermaid');
  lines.push('sequenceDiagram');
  lines.push('  participant User as 👤 User');
  lines.push('  participant PD as @product-dev');
  lines.push('  participant FS as File System');
  lines.push('');

  for (const [laneName, commands] of Object.entries(WORKFLOW_LANES)) {
    if (commands.length === 0) continue;

    // Enter the lane
    lines.push(`  rect rgb(240, 245, 255)`);
    lines.push(`    Note over User,FS: ${laneName} Workflow`);

    commands.forEach((cmd, i) => {
      const next = getNextCommand(cmd);
      const outputPath = COMMAND_OUTPUTS[cmd] ?? `docs/generated/${cmd}.md`;

      // Don't show transitions from the last command in this lane if its next is outside the lane
      if (next && commands.slice(i + 1).includes(next)) {
        lines.push(`    User->>+PD: /${cmd}`);
        lines.push(`    PD->>+FS: Write ${outputPath}`);
        lines.push(`    FS-->>-PD: Saved`);
        lines.push(`    PD-->>-User: Ready`);
        lines.push(`    User->>User: Next: /${next}`);
        lines.push('');
      }
    });

    lines.push('  rect end');
    lines.push('');
  }

  lines.push('```');
  return lines.join('\n');
}

/**
 * Render all known workflow lanes as a compact table.
 */
export function renderWorkflowLanesTable(): string {
  const rows: string[] = ['| Workflow Lane | Steps |', '|---|---|'];
  for (const [lane, steps] of Object.entries(WORKFLOW_LANES)) {
    rows.push(`| ${lane} | ${steps.map(s => `/${s}`).join(' → ')} |`);
  }
  return rows.join('\n');
}
