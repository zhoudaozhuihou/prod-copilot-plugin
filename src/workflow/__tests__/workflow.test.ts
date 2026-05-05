import { describe, it, expect } from 'vitest';
import {
  COMMAND_OUTPUTS,
  getNextCommand,
  getNextStepHint,
  artifactPathFor,
  renderToolCommandTable,
  renderWorkflowTable,
  renderWorkflowSequenceDiagram,
  renderWorkflowLanesTable,
} from '../workflow';

describe('COMMAND_OUTPUTS', () => {
  it('should map all requirement commands to docs/01-requirements/', () => {
    expect(COMMAND_OUTPUTS['requirements']).toBe('docs/01-requirements/requirements.md');
    expect(COMMAND_OUTPUTS['requirements-intake']).toBe('docs/01-requirements/requirements-intake.md');
    expect(COMMAND_OUTPUTS['requirements-clarify']).toBe('docs/01-requirements/requirements-clarify.md');
    expect(COMMAND_OUTPUTS['requirements-map']).toBe('docs/01-requirements/requirements-map.md');
    expect(COMMAND_OUTPUTS['requirements-prioritize']).toBe('docs/01-requirements/requirements-prioritize.md');
    expect(COMMAND_OUTPUTS['requirements-review']).toBe('docs/01-requirements/requirements-review.md');
    expect(COMMAND_OUTPUTS['requirements-trace']).toBe('docs/01-requirements/requirements-traceability-matrix.md');
  });

  it('should map test commands to docs/test/', () => {
    expect(COMMAND_OUTPUTS['api-test-gen']).toBe('docs/test/api-test-requests.md');
    expect(COMMAND_OUTPUTS['springboot-api-tests']).toBe('docs/test/springboot-api-tests.md');
    expect(COMMAND_OUTPUTS['python-api-tests']).toBe('docs/test/python-api-tests.md');
    expect(COMMAND_OUTPUTS['backend-api-scan']).toBe('docs/test/backend-api-code-scan.md');
    expect(COMMAND_OUTPUTS['test']).toBe('docs/test/test-plan.md');
  });

  it('should map data commands to docs/data/ and docs/data-quality/', () => {
    expect(COMMAND_OUTPUTS['sql']).toBe('docs/data/sql-design-and-optimization.md');
    expect(COMMAND_OUTPUTS['nl2sql']).toBe('docs/data/nl2sql.md');
    expect(COMMAND_OUTPUTS['sql-review']).toBe('docs/data/sql-review.md');
    expect(COMMAND_OUTPUTS['sql-translate']).toBe('docs/data/sql-translate.md');
    expect(COMMAND_OUTPUTS['data']).toBe('docs/data/data-development-plan.md');
    expect(COMMAND_OUTPUTS['dq']).toBe('docs/data-quality/dq-rules.md');
  });

  it('should map diagram commands to docs/diagrams/', () => {
    expect(COMMAND_OUTPUTS['architecture-diagram']).toBe('docs/diagrams/architecture-diagrams.md');
    expect(COMMAND_OUTPUTS['journey-diagram']).toBe('docs/diagrams/user-journey-diagrams.md');
    expect(COMMAND_OUTPUTS['diagram']).toBe('docs/diagrams/project-diagram-pack.md');
  });

  it('should have output paths for all major backend commands', () => {
    expect(COMMAND_OUTPUTS['backend']).toBe('docs/backend/backend-design.md');
    expect(COMMAND_OUTPUTS['springboot']).toBe('docs/backend/springboot-implementation-plan.md');
    expect(COMMAND_OUTPUTS['python']).toBe('docs/backend/python-implementation-plan.md');
    expect(COMMAND_OUTPUTS['api']).toBe('docs/api/api-contract.md');
  });

  it('should have output paths for frontend commands', () => {
    expect(COMMAND_OUTPUTS['frontend']).toBe('docs/frontend/frontend-design-and-implementation.md');
    expect(COMMAND_OUTPUTS['design-md']).toBe('docs/frontend/DESIGN.md');
    expect(COMMAND_OUTPUTS['ui-design']).toBe('docs/frontend/ui-design.md');
  });

  it('should have output paths for code intelligence commands', () => {
    expect(COMMAND_OUTPUTS['code-graph']).toBe('docs/code-intelligence/code-graph-map.md');
    expect(COMMAND_OUTPUTS['impact-analysis']).toBe('docs/code-intelligence/impact-analysis.md');
    expect(COMMAND_OUTPUTS['code-wiki']).toBe('docs/code-intelligence/code-wiki.md');
  });
});

describe('getNextCommand', () => {
  it('should follow requirements workflow', () => {
    expect(getNextCommand('init')).toBe('scan');
    expect(getNextCommand('scan')).toBe('plan');
    expect(getNextCommand('plan')).toBe('requirements-intake');
    expect(getNextCommand('requirements-intake')).toBe('requirements-clarify');
    expect(getNextCommand('requirements-clarify')).toBe('requirements-map');
    expect(getNextCommand('requirements-map')).toBe('requirements-prioritize');
    expect(getNextCommand('requirements-prioritize')).toBe('requirements-review');
    expect(getNextCommand('requirements-review')).toBe('requirements-trace');
    expect(getNextCommand('requirements-trace')).toBe('feature');
  });

  it('should follow backend API test workflow', () => {
    expect(getNextCommand('backend')).toBe('api-test-gen');
    expect(getNextCommand('springboot')).toBe('springboot-api-tests');
    expect(getNextCommand('python')).toBe('python-api-tests');
    expect(getNextCommand('api')).toBe('api-test-gen');
    expect(getNextCommand('api-test-gen')).toBe('test');
  });

  it('should follow data SQL workflow', () => {
    expect(getNextCommand('sql')).toBe('sql-review');
    expect(getNextCommand('nl2sql')).toBe('sql-review');
    expect(getNextCommand('sql-review')).toBe('dq');
    expect(getNextCommand('dq')).toBe('reconcile');
    expect(getNextCommand('reconcile')).toBe('lineage');
    expect(getNextCommand('lineage')).toBe('data-review');
  });

  it('should return undefined for terminal commands', () => {
    expect(getNextCommand('data-review')).toBeUndefined();
    expect(getNextCommand('runbook')).toBeUndefined();
    expect(getNextCommand('unknown-command')).toBeUndefined();
  });

  it('should have no circular dependencies in NEXT chain', () => {
    const visited = new Set<string>();
    const checkCycle = (cmd: string, path: string[]): void => {
      if (path.includes(cmd)) {
        throw new Error(`Circular dependency detected: ${path.join(' -> ')} -> ${cmd}`);
      }
      visited.add(cmd);
      const next = getNextCommand(cmd);
      if (next && !visited.has(next)) {
        checkCycle(next, [...path, cmd]);
      }
    };

    // Check all known commands
    for (const cmd of Object.keys(COMMAND_OUTPUTS)) {
      if (!visited.has(cmd)) {
        checkCycle(cmd, []);
      }
    }
  });
});

describe('getNextStepHint', () => {
  it('should return @product-dev prefixed hint', () => {
    const hint = getNextStepHint('backend');
    expect(hint).toMatch(/^@product-dev \//);
  });

  it('should use exposed command names for commands in the NEXT map', () => {
    // 'backend' maps to 'api-test-gen' in NEXT → getExposedCommand('api-test-gen') = 'test-api-gen'
    const hint = getNextStepHint('backend');
    expect(hint).toBe('@product-dev /test-api-gen');
  });

  it('should fall back to plan for commands not in the NEXT map', () => {
    const hint = getNextStepHint('frontend');
    expect(hint).toBe('@product-dev /plan');
  });
});

describe('artifactPathFor', () => {
  it('should return correct path for known commands', () => {
    expect(artifactPathFor('prd')).toBe('docs/prd/generated-prd.md');
    expect(artifactPathFor('feature')).toBe('docs/01-product/feature-design.md');
    expect(artifactPathFor('journey')).toBe('docs/journey/user-journey.md');
    expect(artifactPathFor('release')).toBe('docs/release/release-notes-and-checklist.md');
    expect(artifactPathFor('pipeline')).toBe('docs/data-pipeline/pipeline-design.md');
    expect(artifactPathFor('lineage')).toBe('docs/lineage/table-and-field-lineage.md');
  });

  it('should return fallback path for unknown commands', () => {
    const result = artifactPathFor('unknown-new-command');
    expect(result).toBe('docs/generated/unknown-new-command.md');
  });

  it('should handle empty command gracefully', () => {
    const result = artifactPathFor('');
    expect(result).toBe('docs/generated/.md');
  });
});

describe('renderToolCommandTable', () => {
  it('should return a markdown table', () => {
    const table = renderToolCommandTable();
    expect(table).toContain('| Command | Purpose |');
    expect(table).toContain('/prompt');
    expect(table).toContain('/sql-review');
    expect(table).toContain('/api-test-gen');
    expect(table).toMatch(/\|.+\|.+\|/); // Has table rows
  });
});

describe('renderWorkflowTable', () => {
  it('should return markdown with workflow descriptions', () => {
    const table = renderWorkflowTable();
    expect(table).toContain('Requirements');
    expect(table).toContain('Backend API testing');
    expect(table).toContain('Data SQL');
    expect(table).toMatch(/\|.+\|.+\|/); // Has table rows
  });
});

describe('renderWorkflowSequenceDiagram', () => {
  it('should produce valid mermaid sequence diagram', () => {
    const diagram = renderWorkflowSequenceDiagram();
    expect(diagram).toContain('```mermaid');
    expect(diagram).toContain('sequenceDiagram');
    expect(diagram).toContain('participant User');
    expect(diagram).toContain('participant PD as @product-dev');
    expect(diagram).toContain('Requirements Workflow');
    expect(diagram).toContain('Backend API Workflow');
    expect(diagram).toContain('Data & SQL Workflow');
    expect(diagram).toContain('Write docs/');
    expect(diagram).toContain('```');
  });

  it('should contain references to known commands in transitions', () => {
    const diagram = renderWorkflowSequenceDiagram();
    expect(diagram).toContain('/requirements-intake');
    expect(diagram).toContain('/nl2sql');
    expect(diagram).toContain('/review');
  });
});

describe('renderWorkflowLanesTable', () => {
  it('should list all workflow lanes', () => {
    const table = renderWorkflowLanesTable();
    expect(table).toContain('Requirements');
    expect(table).toContain('Backend API');
    expect(table).toContain('Data & SQL');
    expect(table).toContain('Delivery');
    expect(table).toContain('Architecture');
    expect(table).toMatch(/\|.+\|.+\|/);
  });

  it('should show command sequences for each lane', () => {
    const table = renderWorkflowLanesTable();
    expect(table).toContain('/nl2sql');
    expect(table).toContain('/sql-review');
    expect(table).toContain('/release');
  });
});
