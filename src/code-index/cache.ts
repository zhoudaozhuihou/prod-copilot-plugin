/**
 * JSON-based file mtime cache for incremental code index updates.
 *
 * Stores per-file metadata in .product-dev/code-index-cache/ so that
 * re-scans only process files whose mtime has changed since the last index build.
 * Uses content hash (first 8 chars of xxhash-style SHA-256) for change detection.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import type { FileCacheEntry, CodeIndexSnapshot, IndexerConfig } from './types';
import { DEFAULT_INDEXER_CONFIG } from './types';
import { detectLanguage, scanFile } from './scanner';
import { renderSummary } from './summary';

const SNAPSHOT_VERSION = 1;
const SNAPSHOT_FILENAME = 'snapshot.json';

/**
 * Build or refresh the code index for a workspace.
 *
 * @param workspaceRoot - Absolute path to the workspace root
 * @param config - Indexer configuration (optional, defaults apply)
 * @returns The built CodeIndexSnapshot
 */
export function buildIndex(workspaceRoot: string, config?: Partial<IndexerConfig>): CodeIndexSnapshot {
  const cfg: IndexerConfig = { ...DEFAULT_INDEXER_CONFIG, ...config };
  const cacheDir = path.join(workspaceRoot, cfg.cacheDir);

  // Load existing snapshot if available
  const existing = loadSnapshot(cacheDir);

  // Collect all relevant files
  const files = collectFiles(workspaceRoot, cfg);

  const newFiles: Record<string, FileCacheEntry> = {};
  let entityCount = 0;
  let changedCount = 0;
  let skippedCount = 0;

  for (const filePath of files) {
    try {
      const stat = fs.statSync(filePath);
      if (stat.size > cfg.maxFileSizeBytes) {
        skippedCount++;
        continue;
      }

      const language = detectLanguage(filePath);

      // Check if file is unchanged (same mtime + same size)
      const cached = existing?.files?.[filePath];
      if (cached && cached.mtimeMs === stat.mtimeMs && cached.sizeBytes === stat.size) {
        // Reuse cached entities
        newFiles[filePath] = cached;
        entityCount += cached.entities.length;
        continue;
      }

      // Content changed or new — rescan
      const content = fs.readFileSync(filePath, 'utf8');
      const contentHash = hashContent(content);
      const entities = scanFile(filePath, content, language);

      newFiles[filePath] = {
        filePath,
        language,
        sizeBytes: stat.size,
        mtimeMs: stat.mtimeMs,
        contentHash,
        entities,
      };
      entityCount += entities.length;
      changedCount++;
    } catch {
      // Skip unreadable files
      skippedCount++;
    }
  }

  // Build summary
  const summary = renderSummary(Object.values(newFiles), workspaceRoot);

  const snapshot: CodeIndexSnapshot = {
    version: SNAPSHOT_VERSION,
    workspaceRoot,
    builtAt: Date.now(),
    fileCount: Object.keys(newFiles).length,
    entityCount,
    files: newFiles,
    summary,
  };

  // Persist to cache directory
  saveSnapshot(cacheDir, snapshot);

  return snapshot;
}

/**
 * Load a previously built snapshot from the cache directory.
 */
export function loadSnapshot(cacheDir: string): CodeIndexSnapshot | null {
  try {
    const p = path.join(cacheDir, SNAPSHOT_FILENAME);
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw) as CodeIndexSnapshot;
  } catch {
    return null;
  }
}

/**
 * Save the snapshot to the cache directory.
 */
function saveSnapshot(cacheDir: string, snapshot: CodeIndexSnapshot): void {
  try {
    fs.mkdirSync(cacheDir, { recursive: true });
    const p = path.join(cacheDir, SNAPSHOT_FILENAME);
    // Strip file content to reduce cache size — only store structural metadata
    fs.writeFileSync(p, JSON.stringify(snapshot, null, 0), 'utf8');
  } catch (err) {
    console.warn('Failed to persist code index cache:', err);
  }
}

/**
 * Calculate a short content hash for change detection.
 */
function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
}

/**
 * Walk the workspace directory and collect source files.
 */
function collectFiles(root: string, config: IndexerConfig): string[] {
  const results: string[] = [];
  const stack = [root];
  const cacheDirAbsolute = path.resolve(root, config.cacheDir);

  while (stack.length > 0 && results.length < config.maxFiles * 3) {
    const dir = stack.pop()!;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    // Skip the cache directory itself to avoid indexing its snapshot.json
    if (path.resolve(dir) === cacheDirAbsolute) continue;

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Check exclusion patterns
      if (config.excludePatterns.some(p => p.test(fullPath))) continue;

      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile()) {
        results.push(fullPath);
      }
    }
  }

  // Sort to ensure deterministic ordering
  results.sort();
  return results.slice(0, config.maxFiles);
}

/**
 * Get the cached summary for quick injection without a full rebuild.
 * Returns undefined if no cache exists yet.
 */
export function getCachedSummary(workspaceRoot: string, config?: Partial<IndexerConfig>): string | undefined {
  const cfg: IndexerConfig = { ...DEFAULT_INDEXER_CONFIG, ...config };
  const cacheDir = path.join(workspaceRoot, cfg.cacheDir);
  const snapshot = loadSnapshot(cacheDir);
  return snapshot?.summary;
}

/**
 * Clear the code index cache.
 */
export function clearCache(workspaceRoot: string, config?: Partial<IndexerConfig>): void {
  const cfg: IndexerConfig = { ...DEFAULT_INDEXER_CONFIG, ...config };
  const cacheDir = path.join(workspaceRoot, cfg.cacheDir);
  try {
    const p = path.join(cacheDir, SNAPSHOT_FILENAME);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch {
    // ignore
  }
}
