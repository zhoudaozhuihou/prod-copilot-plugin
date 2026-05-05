import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { getCodeContext, rescan, getFilesByKind } from '../indexer';

function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'code-indexer-test-'));
}

function writeFile(dir: string, relativePath: string, content: string): string {
  const fullPath = path.join(dir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  return fullPath;
}

describe('getCodeContext', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should return empty index for empty workspace', () => {
    const result = getCodeContext(tempDir, true, { cacheDir: '.test-cache' });
    expect(result.fileCount).toBe(0);
    expect(result.entityCount).toBe(0);
    expect(result.fromCache).toBe(false);
    expect(result.changedFiles).toEqual([]);
    expect(result.summary).toContain('built in');
  });

  it('should index a workspace with source files', () => {
    writeFile(tempDir, 'src/user.ts', 'export class User {\n  constructor(public id: number) {}\n}');
    writeFile(tempDir, 'src/util.ts', 'export function greet(name: string): string { return `Hello ${name}`; }');

    const result = getCodeContext(tempDir, true, { cacheDir: '.test-cache' });
    expect(result.fileCount).toBe(2);
    expect(result.entityCount).toBeGreaterThanOrEqual(2);
    expect(result.summary).toContain('Files indexed: 2');
    expect(result.builtAt).toBeGreaterThan(0);
  });

  it('should return from cache on second call', () => {
    writeFile(tempDir, 'src/index.ts', 'export const x = 1;');

    // First call: fresh build
    const first = getCodeContext(tempDir, false, { cacheDir: '.test-cache' });
    expect(first.fromCache).toBe(false);

    // Second call: should use cache
    const second = getCodeContext(tempDir, false, { cacheDir: '.test-cache' });
    expect(second.fromCache).toBe(true);
    expect(second.fileCount).toBe(1);
  });

  it('should force rebuild when forceRebuild is true', () => {
    writeFile(tempDir, 'src/index.ts', 'export const x = 1;');

    // First call to build cache
    getCodeContext(tempDir, false, { cacheDir: '.test-cache' });

    // Force rebuild
    const result = getCodeContext(tempDir, true, { cacheDir: '.test-cache' });
    expect(result.fromCache).toBe(false);
  });

  it('should detect route entities', () => {
    writeFile(tempDir, 'src/routes.ts',
      'router.get("/api/users", handler);\nrouter.post("/api/users", handler);');

    const result = getCodeContext(tempDir, true, { cacheDir: '.test-cache' });
    expect(result.entityCount).toBeGreaterThanOrEqual(2);
  });

  it('should index Java with Spring Boot annotations', () => {
    writeFile(tempDir, 'src/main/java/UserController.java',
      '@RestController\n@RequestMapping("/api")\npublic class UserController {\n  @GetMapping("/{id}")\n  public User get(@PathVariable Long id) { return null; }\n}');

    const result = getCodeContext(tempDir, true, { cacheDir: '.test-cache' });
    expect(result.fileCount).toBe(1);
    expect(result.summary).toContain('Controllers');
    expect(result.summary).toContain('UserController');
  });

  it('should return summary capped with index timestamp', () => {
    writeFile(tempDir, 'src/index.ts', 'export const x = 1;');

    const result = getCodeContext(tempDir, true, { cacheDir: '.test-cache' });
    expect(result.summary).toContain('built in');
    expect(result.summary).toContain('Files indexed: 1');
  });

  it('should handle multiple languages in one workspace', () => {
    writeFile(tempDir, 'src/main.ts', 'export class App {}');
    writeFile(tempDir, 'src/models.py', 'class User:\n    pass');
    writeFile(tempDir, 'db/schema.sql', 'CREATE TABLE orders (id INT);');

    const result = getCodeContext(tempDir, true, { cacheDir: '.test-cache' });
    expect(result.fileCount).toBe(3);
    expect(result.summary).toContain('typescript');
    expect(result.summary).toContain('python');
    expect(result.summary).toContain('sql');
  });
});

describe('rescan', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should always rebuild the index', () => {
    writeFile(tempDir, 'src/index.ts', 'export const x = 1;');

    // First build (caches)
    getCodeContext(tempDir, false, { cacheDir: '.test-cache' });

    // rescan should force rebuild
    const result = rescan(tempDir, { cacheDir: '.test-cache' });
    expect(result.fromCache).toBe(false);
  });

  it('should reflect file changes after rescan', () => {
    writeFile(tempDir, 'src/index.ts', 'export const x = 1;');
    getCodeContext(tempDir, false, { cacheDir: '.test-cache' });

    // Add a new file
    writeFile(tempDir, 'src/new.ts', 'export class NewClass {}');

    const result = rescan(tempDir, { cacheDir: '.test-cache' });
    expect(result.fileCount).toBe(2);
  });
});

describe('getFilesByKind', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should return empty array when no cache exists', () => {
    const files = getFilesByKind(tempDir, 'controller');
    expect(files).toEqual([]);
  });

  it('should return files containing specific entity kinds', () => {
    writeFile(tempDir, 'src/UserController.java',
      '@RestController\npublic class UserController {\n  @GetMapping("/users")\n  public void list() {}\n}');
    writeFile(tempDir, 'src/ItemController.java',
      '@RestController\npublic class ItemController {\n  @GetMapping("/items")\n  public void list() {}\n}');
    writeFile(tempDir, 'src/UserService.java',
      '@Service\npublic class UserService {\n  public void doStuff() {}\n}');

    getCodeContext(tempDir, true, { cacheDir: '.test-cache' });

    const controllers = getFilesByKind(tempDir, 'controller', { cacheDir: '.test-cache' });
    expect(controllers).toHaveLength(2);
    expect(controllers.some(f => f.includes('UserController'))).toBe(true);
    expect(controllers.some(f => f.includes('ItemController'))).toBe(true);
  });
});
