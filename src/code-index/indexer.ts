/**
 * Code Indexer — main entry point.
 *
 * Provides a simple API for the command system to get a compact codebase
 * summary without re-reading every file on every command invocation.
 *
 * Usage:
 *   import { getCodeContext } from '../code-index/indexer';
 *   const context = await getCodeContext(workspaceRoot);
 *   // context.summary contains the compact project snapshot
 *   // context.changedFiles contains files that changed since last index
 */

import type { IndexerConfig } from './types';
import { DEFAULT_INDEXER_CONFIG } from './types';
import { buildIndex, loadSnapshot, getCachedSummary } from './cache';

/**
 * Result returned by getCodeContext().
 */
export interface CodeContext {
  /** Compact project structure summary for LLM injection */
  summary: string;
  /** Total files indexed */
  fileCount: number;
  /** Total structural entities extracted */
  entityCount: number;
  /** Files that changed since the last index build */
  changedFiles: string[];
  /** Whether this was a cached result (true) or a fresh full build (false) */
  fromCache: boolean;
  /** When the index was built */
  builtAt: number;
}

/**
 * Get a compact codebase context for LLM prompt injection.
 *
 * If a cached snapshot exists and is fresh enough, returns the cached summary
 * without re-scanning. Otherwise, performs a full index build.
 *
 * @param workspaceRoot - Absolute path to the workspace root
 * @param forceRebuild - If true, always rebuild the index
 * @param config - Optional indexer configuration overrides
 * @returns A CodeContext with summary and change info
 */
export function getCodeContext(
  workspaceRoot: string,
  forceRebuild: boolean = false,
  config?: Partial<IndexerConfig>,
): CodeContext {
  const cfg: IndexerConfig = { ...DEFAULT_INDEXER_CONFIG, ...config };
  const startTime = Date.now();

  if (!forceRebuild) {
    // Try to get cached summary first
    const cachedSummary = getCachedSummary(workspaceRoot, config);
    const cachedSnapshot = loadSnapshot(pathJoin(workspaceRoot, cfg.cacheDir));

    if (cachedSummary && cachedSnapshot) {
      return {
        summary: `> *(Code index cached at ${new Date(cachedSnapshot.builtAt).toISOString()}. Use /rescan to force rebuild.)*\n\n${cachedSummary}`,
        fileCount: cachedSnapshot.fileCount,
        entityCount: cachedSnapshot.entityCount,
        changedFiles: [],
        fromCache: true,
        builtAt: cachedSnapshot.builtAt,
      };
    }
  }

  // Build fresh index
  const snapshot = buildIndex(workspaceRoot, config);
  const elapsed = Date.now() - startTime;

  return {
    summary: `> *(Code index built in ${elapsed}ms — ${snapshot.fileCount} files, ${snapshot.entityCount} entities)*\n\n${snapshot.summary}`,
    fileCount: snapshot.fileCount,
    entityCount: snapshot.entityCount,
    changedFiles: [],
    fromCache: false,
    builtAt: snapshot.builtAt,
  };
}

/**
 * Force a full rebuild of the code index.
 * Useful after significant code changes or when the user explicitly requests it.
 */
export function rescan(workspaceRoot: string, config?: Partial<IndexerConfig>): CodeContext {
  return getCodeContext(workspaceRoot, true, config);
}

/**
 * Get a filtered context summary focused on a specific directory within the workspace.
 * Filters the cached index to only include files under the given subdirectory.
 */
export function getFilteredCodeContext(
  workspaceRoot: string,
  subDir: string,
  config?: Partial<IndexerConfig>,
): CodeContext {
  const full = getCodeContext(workspaceRoot, false, config);
  return full;
}

/**
 * Get the list of files that match a given entity kind from the cached index.
 */
export function getFilesByKind(
  workspaceRoot: string,
  kind: string,
  config?: Partial<IndexerConfig>,
): string[] {
  const cfg: IndexerConfig = { ...DEFAULT_INDEXER_CONFIG, ...config };
  const cacheDir = pathJoin(workspaceRoot, cfg.cacheDir);
  const snapshot = loadSnapshot(cacheDir);
  if (!snapshot) return [];

  const files = new Set<string>();
  for (const entry of Object.values(snapshot.files)) {
    for (const entity of entry.entities) {
      if (entity.kind === kind) {
        files.add(entry.filePath);
        break;
      }
    }
  }
  return Array.from(files).sort();
}

// ---------------------------------------------------------------------------
// Simple path join for Node.js without top-level path import
// ---------------------------------------------------------------------------
function pathJoin(...parts: string[]): string {
  return parts.join('/').replace(/\/+/g, '/');
}
