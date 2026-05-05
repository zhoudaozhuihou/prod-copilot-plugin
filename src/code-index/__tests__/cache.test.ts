import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { buildIndex, loadSnapshot, getCachedSummary, clearCache } from '../cache';

function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'code-cache-test-'));
}

function writeFile(dir: string, relativePath: string, content: string): string {
  const fullPath = path.join(dir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  return fullPath;
}

describe('buildIndex', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should build index for an empty workspace', () => {
    const config = { cacheDir: '.test-cache' };
    const snapshot = buildIndex(tempDir, config);
    expect(snapshot.fileCount).toBe(0);
    expect(snapshot.entityCount).toBe(0);
    expect(snapshot.summary).toContain('Files indexed: 0');
  });

  it('should index TypeScript files and extract entities', () => {
    writeFile(tempDir, 'src/user.ts', 'export class User {\n  constructor(public id: number) {}\n}');
    writeFile(tempDir, 'src/util.ts', 'export function formatDate(d: Date): string { return ""; }');

    const config = { cacheDir: '.test-cache' };
    const snapshot = buildIndex(tempDir, config);
    expect(snapshot.fileCount).toBe(2);
    expect(snapshot.entityCount).toBeGreaterThanOrEqual(2);
    expect(snapshot.summary).toContain('Files indexed: 2');
  });

  it('should index Java Spring Boot files', () => {
    writeFile(tempDir, 'src/main/java/com/example/UserController.java',
      '@RestController\n@RequestMapping("/api/users")\npublic class UserController {\n  @GetMapping("/{id}")\n  public User get(@PathVariable Long id) { return null; }\n}');
    writeFile(tempDir, 'src/main/java/com/example/UserService.java',
      '@Service\npublic class UserService {\n  public User findById(Long id) { return null; }\n}');

    const config = { cacheDir: '.test-cache' };
    const snapshot = buildIndex(tempDir, config);
    expect(snapshot.fileCount).toBe(2);
    expect(snapshot.entityCount).toBeGreaterThanOrEqual(3);
    expect(snapshot.summary).toContain('Controllers');
  });

  it('should index Python FastAPI files', () => {
    writeFile(tempDir, 'app/routes.py',
      'from fastapi import APIRouter\nrouter = APIRouter()\n\n@router.get("/items")\nasync def list_items(): pass\n\n@router.post("/items")\nasync def create_item(): pass');

    const config = { cacheDir: '.test-cache' };
    const snapshot = buildIndex(tempDir, config);
    expect(snapshot.fileCount).toBe(1);
    expect(snapshot.entityCount).toBeGreaterThanOrEqual(2);
  });

  it('should index SQL files', () => {
    writeFile(tempDir, 'sql/schema.sql',
      'CREATE TABLE users (\n  id BIGINT PRIMARY KEY,\n  name VARCHAR(255)\n);\nCREATE VIEW active_users AS SELECT * FROM users;');

    const config = { cacheDir: '.test-cache' };
    const snapshot = buildIndex(tempDir, config);
    expect(snapshot.fileCount).toBe(1);
    expect(snapshot.entityCount).toBeGreaterThanOrEqual(2);
    expect(snapshot.summary).toContain('SQL Tables');
  });

  it('should skip files in excluded directories', () => {
    writeFile(tempDir, 'node_modules/pkg/index.js', 'function x() {}');
    writeFile(tempDir, 'src/index.ts', 'export function hello() {}');

    const config = { cacheDir: '.test-cache' };
    const snapshot = buildIndex(tempDir, config);
    expect(snapshot.fileCount).toBe(1);
    expect(snapshot.fileCount).toBeLessThan(2);
  });

  it('should skip files exceeding max size', () => {
    writeFile(tempDir, 'src/large.ts', '// too big\n'.repeat(20000));
    writeFile(tempDir, 'src/small.ts', 'export const x = 1;');

    const config = { cacheDir: '.test-cache', maxFileSizeBytes: 1000 };
    const snapshot = buildIndex(tempDir, config);
    expect(snapshot.fileCount).toBe(1);
  });

  it('should persist snapshot to cache directory', () => {
    writeFile(tempDir, 'src/index.ts', 'export const x = 1;');

    const config = { cacheDir: '.test-cache' };
    buildIndex(tempDir, config);

    const cachePath = path.join(tempDir, '.test-cache', 'snapshot.json');
    expect(fs.existsSync(cachePath)).toBe(true);

    const raw = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    expect(raw.fileCount).toBe(1);
    expect(raw.version).toBe(1);
  });

  it('should reuse unchanged files on second build (incremental)', () => {
    writeFile(tempDir, 'src/stable.ts', 'export const x = 1;');
    writeFile(tempDir, 'src/changed.ts', 'export const y = 2;');

    const config = { cacheDir: '.test-cache' };
    const first = buildIndex(tempDir, config);
    expect(first.fileCount).toBe(2);

    // Modify one file
    fs.writeFileSync(path.join(tempDir, 'src/changed.ts'), 'export const y = 999;', 'utf8');

    const second = buildIndex(tempDir, config);
    expect(second.fileCount).toBe(2);
  });

  it('should handle mixed language workspace', () => {
    writeFile(tempDir, 'src/main.ts', 'export class App {}');
    writeFile(tempDir, 'src/models.py', 'class User:\n    pass');
    writeFile(tempDir, 'db/schema.sql', 'CREATE TABLE orders (id INT);');

    const config = { cacheDir: '.test-cache' };
    const snapshot = buildIndex(tempDir, config);
    expect(snapshot.fileCount).toBe(3);

    // Summary should mention all languages
    expect(snapshot.summary).toContain('typescript');
    expect(snapshot.summary).toContain('python');
  });
});

describe('loadSnapshot', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should return null when no cache exists', () => {
    const result = loadSnapshot(path.join(tempDir, 'nonexistent'));
    expect(result).toBeNull();
  });

  it('should return null for invalid JSON', () => {
    const cacheDir = path.join(tempDir, 'cache');
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(path.join(cacheDir, 'snapshot.json'), 'not-json', 'utf8');
    const result = loadSnapshot(cacheDir);
    expect(result).toBeNull();
  });

  it('should load a valid snapshot', () => {
    const snapshot = {
      version: 1,
      workspaceRoot: tempDir,
      builtAt: Date.now(),
      fileCount: 5,
      entityCount: 10,
      files: {},
      summary: 'Test summary',
    };
    const cacheDir = path.join(tempDir, 'cache');
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(path.join(cacheDir, 'snapshot.json'), JSON.stringify(snapshot), 'utf8');

    const loaded = loadSnapshot(cacheDir);
    expect(loaded).not.toBeNull();
    expect(loaded!.fileCount).toBe(5);
    expect(loaded!.entityCount).toBe(10);
    expect(loaded!.summary).toBe('Test summary');
  });
});

describe('getCachedSummary', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should return undefined when no cache exists', () => {
    const result = getCachedSummary(tempDir, { cacheDir: '.test-cache' });
    expect(result).toBeUndefined();
  });

  it('should return summary from previously built index', () => {
    writeFile(tempDir, 'src/index.ts', 'export class Service {}');

    const config = { cacheDir: '.test-cache' };
    buildIndex(tempDir, config);

    const summary = getCachedSummary(tempDir, config);
    expect(summary).toBeDefined();
    expect(summary).toContain('Files indexed: 1');
  });
});

describe('clearCache', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should delete the cache file', () => {
    writeFile(tempDir, 'src/index.ts', 'export const x = 1;');

    const config = { cacheDir: '.test-cache' };
    buildIndex(tempDir, config);

    const cachePath = path.join(tempDir, '.test-cache', 'snapshot.json');
    expect(fs.existsSync(cachePath)).toBe(true);

    clearCache(tempDir, config);
    expect(fs.existsSync(cachePath)).toBe(false);
  });

  it('should not throw if cache does not exist', () => {
    expect(() => clearCache(tempDir, { cacheDir: '.test-cache' })).not.toThrow();
  });
});
