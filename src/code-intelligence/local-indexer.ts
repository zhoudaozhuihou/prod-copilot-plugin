import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import * as vscode from 'vscode';

export interface CodeSymbol {
  name: string;
  type: 'function' | 'class' | 'interface' | 'variable' | 'import';
  filePath: string;
  line: number;
  signature?: string;
  dependents?: string[];
}

export interface FileIndex {
  hash: string;
  symbols: CodeSymbol[];
  lastModified: number;
}

export class LocalCodeIndexer {
  private index: Map<string, FileIndex> = new Map();
  private indexPath: string;
  private isBuilding = false;
  
  constructor(private workspaceRoot: string) {
    this.indexPath = path.join(workspaceRoot, '.product-dev', 'code-index.json');
  }

  /**
   * Loads the existing index from disk if available
   */
  async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.indexPath, 'utf-8');
      const parsed = JSON.parse(data);
      this.index = new Map(Object.entries(parsed));
    } catch (e) {
      // No existing index, start fresh
      this.index = new Map();
    }
  }

  /**
   * Saves the current index to disk
   */
  async save(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.indexPath), { recursive: true });
      const obj = Object.fromEntries(this.index);
      await fs.writeFile(this.indexPath, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save code index', e);
    }
  }

  /**
   * Incrementally updates the index by scanning modified files
   */
  async buildOrUpdate(progress?: vscode.Progress<{ message?: string; increment?: number }>): Promise<{ updated: number; total: number }> {
    if (this.isBuilding) return { updated: 0, total: this.index.size };
    this.isBuilding = true;
    
    let updatedCount = 0;
    try {
      const files = await this.getAllSourceFiles(this.workspaceRoot);
      const total = files.length;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (progress && i % 10 === 0) {
          progress.report({ message: `Indexing ${i}/${total} files...`, increment: (10 / total) * 100 });
        }
        
        const stat = await fs.stat(file);
        const relativePath = path.relative(this.workspaceRoot, file);
        const existing = this.index.get(relativePath);
        
        // Skip if unmodified
        if (existing && existing.lastModified >= stat.mtimeMs) {
          continue;
        }
        
        const content = await fs.readFile(file, 'utf-8');
        const hash = crypto.createHash('sha256').update(content).digest('hex');
        
        // Fast skip using hash
        if (existing && existing.hash === hash) {
          existing.lastModified = stat.mtimeMs;
          continue;
        }
        
        // Parse symbols
        const symbols = this.extractSymbols(content, relativePath);
        this.index.set(relativePath, {
          hash,
          symbols,
          lastModified: stat.mtimeMs
        });
        
        updatedCount++;
      }
      
      // Cleanup deleted files
      const currentFiles = new Set(files.map(f => path.relative(this.workspaceRoot, f)));
      for (const key of this.index.keys()) {
        if (!currentFiles.has(key)) {
          this.index.delete(key);
        }
      }
      
      await this.save();
    } finally {
      this.isBuilding = false;
    }
    
    return { updated: updatedCount, total: this.index.size };
  }

  /**
   * Retrieves the blast radius (impact) of a specific symbol or file change
   */
  getImpactRadius(targetPath: string): string[] {
    const affected = new Set<string>([targetPath]);
    const targetBaseName = path.basename(targetPath, path.extname(targetPath));
    
    for (const [filePath, fileData] of this.index.entries()) {
      if (filePath === targetPath) continue;
      
      // Simple dependency tracing: check if other files import or use symbols from target
      const usesTarget = fileData.symbols.some(s => 
        s.type === 'import' && s.name.includes(targetBaseName)
      );
      
      if (usesTarget) {
        affected.add(filePath);
      }
    }
    
    return Array.from(affected);
  }

  /**
   * Generates a highly compressed context map for LLM consumption (Inspired by rtk)
   * 
   * Strategy:
   * 1. Smart Filtering: Removes boilerplate, keeps only signatures.
   * 2. Truncation: Strips full function bodies to save tokens.
   * 3. Grouping: Aggregates symbols by file.
   */
  getReviewContext(files: string[], aggressiveCompression = false): string {
    const lines: string[] = [];
    lines.push('## Code Structural Context');
    
    let totalTokensSaved = 0;

    for (const file of files) {
      const fileData = this.index.get(file);
      if (!fileData) continue;
      
      lines.push(`\n### ${file}`);
      const exports = fileData.symbols.filter(s => s.type !== 'import');
      
      if (exports.length > 0) {
        lines.push('Defined Symbols (Bodies Stripped):');
        exports.forEach(s => {
          lines.push(`- [${s.type}] ${s.name} ${s.signature ? '(' + s.signature + ')' : ''}`);
          totalTokensSaved += 50; // Rough estimate of tokens saved per stripped body
        });
      }

      if (!aggressiveCompression) {
        const imports = fileData.symbols.filter(s => s.type === 'import');
        if (imports.length > 0) {
          // Group imports to save tokens (rtk grouping strategy)
          lines.push(`Imports: ${imports.map(i => i.name).join(', ')}`);
        }
      }
    }
    
    lines.push(`\n*(Note: Context compressed. Estimated ~${totalTokensSaved} tokens saved by stripping implementation bodies.)*`);
    return lines.join('\n');
  }

  // --- Private Helpers ---

  private async getAllSourceFiles(dir: string, fileList: string[] = []): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!/node_modules|\.git|dist|build|target|venv|__pycache__|\.product-dev/i.test(entry.name)) {
          await this.getAllSourceFiles(fullPath, fileList);
        }
      } else {
        if (/\.(ts|js|py|java|go|rs|cpp|cs)$/i.test(entry.name)) {
          fileList.push(fullPath);
        }
      }
    }
    return fileList;
  }

  /**
   * Lightweight regex-based symbol extractor (Inspired by Tree-sitter but regex for portability)
   */
  private extractSymbols(content: string, filePath: string): CodeSymbol[] {
    const symbols: CodeSymbol[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Extract TS/JS/Java Classes
      const classMatch = line.match(/(?:export\s+|public\s+)?(?:class|interface)\s+([A-Za-z0-9_]+)/);
      if (classMatch) {
        symbols.push({ name: classMatch[1], type: classMatch[0].includes('interface') ? 'interface' : 'class', filePath, line: i + 1 });
      }
      
      // Extract TS/JS/Java/Python Functions
      const funcMatch = line.match(/(?:export\s+|public\s+|private\s+)?(?:async\s+)?(?:function|def)\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/);
      if (funcMatch) {
        symbols.push({ name: funcMatch[1], type: 'function', filePath, line: i + 1, signature: funcMatch[2] });
      }
      
      // Extract Imports
      const importMatch = line.match(/import\s+(?:.*from\s+)?['"]([^'"]+)['"]/);
      if (importMatch) {
        symbols.push({ name: importMatch[1], type: 'import', filePath, line: i + 1 });
      }
    }
    
    return symbols;
  }
}
