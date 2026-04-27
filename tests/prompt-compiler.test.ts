import { describe, expect, it } from 'vitest';
import { compilePrompt } from '../src/prompt/prompt-compiler';
import { RepoContext } from '../src/core/types';

const repo: RepoContext = {
  workspaceRoot: '/tmp/project',
  repoName: 'project',
  techStack: ['React'],
  routeHints: ['/home'],
  apiHints: ['/api/items'],
  databaseHints: [],
  frontendHints: ['useState'],
  backendHints: [],
  dataPipelineHints: [],
  sourceFiles: [],
  config: { outputRoot: 'docs', maxContextFiles: 10, writeArtifacts: true }
};

describe('compilePrompt', () => {
  it('builds brainstorm prompt package', () => {
    const result = compilePrompt('brainstorm', 'design metadata search', repo);
    expect(result.title).toContain('Brainstorming');
    expect(result.outputSchema).toContain('Feature Ideas Backlog');
    expect(result.artifactPath).toBe('product/brainstorm.md');
  });

  it('compiles frontend prompt', () => {
    const p = compilePrompt('frontend', 'build page', repo);
    expect(p.artifactPath).toContain('frontend');
    expect(p.outputSchema).toContain('Component Breakdown');
  });

  it('compiles Spring Boot prompt', () => {
    const p = compilePrompt('springboot', 'create service', {
      ...repo,
      techStack: ['Spring Boot', 'PostgreSQL'],
      backendHints: ['@RestController'],
      databaseHints: ['postgresql']
    });
    expect(p.artifactPath).toContain('springboot');
    expect(p.outputSchema).toContain('Controller');
  });

  it('compiles SQL prompt', () => {
    const p = compilePrompt('sql', 'optimize query', {
      ...repo,
      techStack: ['PostgreSQL'],
      databaseHints: ['postgresql']
    });
    expect(p.outputSchema).toContain('PostgreSQL');
    expect(p.outputSchema).toContain('BigQuery');
  });
});
