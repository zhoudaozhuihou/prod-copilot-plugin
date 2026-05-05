/**
 * Type definitions for the local code index system.
 *
 * The code index is a lightweight structural map of the project that
 * avoids re-reading every file on every command invocation. It stores:
 *   - File-level metadata (path, language, size, last modified)
 *   - Structural entities (classes, functions, interfaces, routes)
 *   - Import/export dependency edges
 *   - File content hashes for change detection
 *
 * All data is stored as JSON under .product-dev/code-index-cache/
 * and updated incrementally based on file mtime changes.
 */

/** Language family classification */
export type CodeLanguage = 'typescript' | 'javascript' | 'java' | 'python' | 'sql' | 'go' | 'rust' | 'yaml' | 'json' | 'markdown' | 'css' | 'html' | 'unknown';

/** Kind of structural entity extracted from source code */
export type EntityKind = 'file' | 'class' | 'interface' | 'enum' | 'record' | 'function' | 'method' | 'route' | 'dto' | 'service' | 'repository' | 'controller' | 'sql_table' | 'sql_view' | 'test';

/** A single structural entity in the codebase */
export interface CodeEntity {
  kind: EntityKind;
  name: string;
  qualifiedName: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  language: CodeLanguage;
  parentName?: string;
  modifiers?: string[];
  /** For route entities: HTTP method + path */
  routeMethod?: string;
  routePath?: string;
}

/** Dependency edge between two entities */
export interface CodeEdge {
  kind: 'imports' | 'extends' | 'implements' | 'calls' | 'composes' | 'references';
  sourceQualified: string;
  targetQualified: string;
  filePath: string;
}

/** Per-file cached metadata */
export interface FileCacheEntry {
  filePath: string;
  language: CodeLanguage;
  sizeBytes: number;
  mtimeMs: number;
  contentHash: string;
  entities: CodeEntity[];
}

/** The complete cached index for a workspace */
export interface CodeIndexSnapshot {
  version: number;
  workspaceRoot: string;
  builtAt: number;
  fileCount: number;
  entityCount: number;
  files: Record<string, FileCacheEntry>;
  /** Collapsed summary for LLM context injection */
  summary: string;
}

/** Configuration for the indexer */
export interface IndexerConfig {
  maxFiles: number;
  maxFileSizeBytes: number;
  excludePatterns: RegExp[];
  cacheDir: string;
}

export const DEFAULT_INDEXER_CONFIG: IndexerConfig = {
  maxFiles: 500,
  maxFileSizeBytes: 200_000,
  excludePatterns: [
    /node_modules/, /\.git/, /target/, /build/, /dist/, /venv/, /__pycache__/,
    /\.next/, /\.svelte-kit/, /coverage/, /\.vscode/, /\.idea/,
    /\.DS_Store/, /\.vsix/, /package-lock\.json/, /yarn\.lock/,
  ],
  cacheDir: '.product-dev/code-index-cache',
};
