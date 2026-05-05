import { describe, it, expect } from 'vitest';
import { renderSummary } from '../summary';
import type { FileCacheEntry } from '../types';

function makeEntity(overrides: Partial<import('../types').CodeEntity>): import('../types').CodeEntity {
  return {
    kind: 'class',
    name: 'TestClass',
    qualifiedName: 'TestClass',
    filePath: '/workspace/src/TestClass.ts',
    lineStart: 1,
    lineEnd: 10,
    language: 'typescript',
    ...overrides,
  };
}

function makeFile(overrides: Partial<FileCacheEntry>): FileCacheEntry {
  return {
    filePath: '/workspace/src/file.ts',
    language: 'typescript',
    sizeBytes: 1000,
    mtimeMs: 1000000,
    contentHash: 'abc12345',
    entities: [],
    ...overrides,
  };
}

describe('renderSummary', () => {
  it('should render empty summary for no files', () => {
    const result = renderSummary([], '/workspace');
    expect(result).toContain('Files indexed: 0');
    expect(result).toContain('Entities extracted: 0');
  });

  it('should show file count and entity count', () => {
    const files = [
      makeFile({ entities: [makeEntity({})] }),
    ];
    const result = renderSummary(files, '/workspace');
    expect(result).toContain('Files indexed: 1');
    expect(result).toContain('Entities extracted: 1');
  });

  it('should show language breakdown', () => {
    const files = [
      makeFile({ filePath: '/workspace/src/a.ts', language: 'typescript' }),
      makeFile({ filePath: '/workspace/src/b.ts', language: 'typescript' }),
      makeFile({ filePath: '/workspace/src/c.py', language: 'python' }),
    ];
    const result = renderSummary(files, '/workspace');
    expect(result).toContain('2 typescript');
    expect(result).toContain('1 python');
  });

  it('should show directory structure', () => {
    const files = [
      makeFile({ filePath: '/workspace/src/main.ts' }),
      makeFile({ filePath: '/workspace/src/util.ts' }),
      makeFile({ filePath: '/workspace/tests/test.ts' }),
    ];
    const result = renderSummary(files, '/workspace');
    expect(result).toContain('src/');
    expect(result).toContain('tests/');
  });

  it('should list controllers in its section', () => {
    const files = [
      makeFile({
        filePath: '/workspace/src/UserController.java',
        entities: [makeEntity({ kind: 'controller', name: 'UserController', language: 'java', filePath: '/workspace/src/UserController.java' })],
      }),
    ];
    const result = renderSummary(files, '/workspace');
    expect(result).toContain('Controllers (1)');
    expect(result).toContain('UserController');
  });

  it('should list API routes in its section', () => {
    const files = [
      makeFile({
        filePath: '/workspace/src/routes.ts',
        entities: [makeEntity({
          kind: 'route', name: 'GET /api/users', routeMethod: 'GET', routePath: '/api/users',
          language: 'typescript', filePath: '/workspace/src/routes.ts',
        })],
      }),
    ];
    const result = renderSummary(files, '/workspace');
    expect(result).toContain('API Routes (1)');
    expect(result).toContain('GET /api/users');
  });

  it('should list services in its section', () => {
    const files = [
      makeFile({
        filePath: '/workspace/src/UserService.java',
        entities: [makeEntity({ kind: 'service', name: 'UserService', language: 'java', filePath: '/workspace/src/UserService.java' })],
      }),
    ];
    const result = renderSummary(files, '/workspace');
    expect(result).toContain('Services (1)');
    expect(result).toContain('UserService');
  });

  it('should list DTOs/models in its section', () => {
    const files = [
      makeFile({
        filePath: '/workspace/src/UserRequest.java',
        entities: [makeEntity({ kind: 'dto', name: 'UserRequest', language: 'java', filePath: '/workspace/src/UserRequest.java' })],
      }),
    ];
    const result = renderSummary(files, '/workspace');
    expect(result).toContain('DTOs / Models (1)');
    expect(result).toContain('UserRequest');
  });

  it('should list classes, interfaces, enums grouped by directory', () => {
    const files = [
      makeFile({
        filePath: '/workspace/src/models/User.ts',
        entities: [
          makeEntity({ kind: 'class', name: 'User', filePath: '/workspace/src/models/User.ts' }),
          makeEntity({ kind: 'interface', name: 'UserRepository', filePath: '/workspace/src/models/User.ts' }),
        ],
      }),
    ];
    const result = renderSummary(files, '/workspace');
    expect(result).toContain('Classes / Interfaces / Enums (2)');
    expect(result).toContain('User');
    expect(result).toContain('UserRepository');
  });

  it('should list SQL tables and views', () => {
    const files = [
      makeFile({
        filePath: '/workspace/db/schema.sql',
        entities: [
          makeEntity({ kind: 'sql_table', name: 'users', language: 'sql', filePath: '/workspace/db/schema.sql' }),
          makeEntity({ kind: 'sql_view', name: 'active_users', language: 'sql', filePath: '/workspace/db/schema.sql' }),
        ],
      }),
    ];
    const result = renderSummary(files, '/workspace');
    expect(result).toContain('SQL Tables / Views (2)');
    expect(result).toContain('users');
  });

  it('should show test files section', () => {
    const files = [
      makeFile({
        filePath: '/workspace/src/__tests__/user.test.ts',
        entities: [makeEntity({ kind: 'function', name: 'should create user', filePath: '/workspace/src/__tests__/user.test.ts' })],
      }),
    ];
    const result = renderSummary(files, '/workspace');
    expect(result).toContain('Tests');
    expect(result).toContain('1 test functions');
  });

  it('should cap output at 8000 characters', () => {
    // Create many files to generate a large summary
    const entities = Array.from({ length: 50 }, (_, i) => makeEntity({ kind: 'function', name: `func${i}` }));
    const files = Array.from({ length: 100 }, (_, i) => makeFile({
      filePath: `/workspace/src/${i}/file.ts`,
      entities: entities.slice(0, 5),
    }));
    const result = renderSummary(files, '/workspace');
    expect(result.length).toBeLessThanOrEqual(8000);
  });

  it('should handle mixed file types correctly', () => {
    const files = [
      makeFile({
        filePath: '/workspace/src/Controller.java',
        language: 'java',
        entities: [
          makeEntity({ kind: 'controller', name: 'ApiController', language: 'java', filePath: '/workspace/src/Controller.java' }),
          makeEntity({ kind: 'route', name: 'GET /api/items', routeMethod: 'GET', routePath: '/api/items', language: 'java', filePath: '/workspace/src/Controller.java' }),
          makeEntity({ kind: 'route', name: 'POST /api/items', routeMethod: 'POST', routePath: '/api/items', language: 'java', filePath: '/workspace/src/Controller.java' }),
        ],
      }),
      makeFile({
        filePath: '/workspace/src/Service.java',
        language: 'java',
        entities: [
          makeEntity({ kind: 'service', name: 'ItemService', language: 'java', filePath: '/workspace/src/Service.java' }),
          makeEntity({ kind: 'class', name: 'ItemMapper', language: 'java', filePath: '/workspace/src/Service.java' }),
        ],
      }),
      makeFile({
        filePath: '/workspace/db/schema.sql',
        language: 'sql',
        entities: [
          makeEntity({ kind: 'sql_table', name: 'items', language: 'sql', filePath: '/workspace/db/schema.sql' }),
        ],
      }),
    ];
    const result = renderSummary(files, '/workspace');
    expect(result).toContain('Controllers (1)');
    expect(result).toContain('API Routes (2)');
    expect(result).toContain('Services (1)');
    expect(result).toContain('SQL Tables / Views (1)');
  });

  it('should not include empty sections', () => {
    const files = [makeFile({})];
    const result = renderSummary(files, '/workspace');
    expect(result).not.toContain('Controllers');
    expect(result).not.toContain('API Routes');
    expect(result).not.toContain('Services');
    expect(result).not.toContain('SQL Tables / Views');
  });
});
