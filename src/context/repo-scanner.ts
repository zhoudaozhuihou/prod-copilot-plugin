/**
 * Product Dev Copilot Source Note
 *
 * File: src/context/repo-scanner.ts
 * Purpose: Repository scanner. Collects file tree and key file excerpts for AI context.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { RepoContext, RepoFileSummary } from '../core/types';
import { ensureDir, normalizePath, readTextIfExists, truncate } from '../utils/fs-utils';
import { detectLanguage, extractApiHints, extractBackendHints, extractDataPipelineHints, extractDatabaseHints, extractFrontendHints, extractRouteHints } from '../utils/text';
import { loadProductDevConfig } from './config-loader';
import { loadPolicyPackContext } from '../policies/policy-pack-loader';

const SOURCE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.vue', '.css', '.scss', '.sass', '.less', '.html', '.htm', '.py', '.go', '.java', '.kt', '.cs', '.sql', '.yaml', '.yml', '.json', '.md', '.xml', '.properties', '.gradle', '.toml'
]);

const EXCLUDED_DIRS = new Set([
  'node_modules', 'dist', 'build', '.git', '.next', '.turbo', '.venv', 'venv', 'target', 'coverage', '.idea', '.vscode-test'
]);

export async function scanRepository(workspaceRoot: string): Promise<RepoContext> {
  const config = await loadProductDevConfig(workspaceRoot);
  const packageInfo = await readPackageHints(workspaceRoot);
  const policyPacks = await loadPolicyPackContext(workspaceRoot, config);
  const files = await collectFiles(workspaceRoot, config.maxContextFiles);
  const sourceFiles: RepoFileSummary[] = [];
  const routeHints = new Set<string>();
  const apiHints = new Set<string>();
  const databaseHints = new Set<string>();
  const frontendHints = new Set<string>();
  const backendHints = new Set<string>();
  const dataPipelineHints = new Set<string>();

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8').catch(() => '');
    const relPath = normalizePath(path.relative(workspaceRoot, file));
    extractRouteHints(content).forEach(v => routeHints.add(v));
    extractApiHints(content).forEach(v => apiHints.add(v));
    extractDatabaseHints(content).forEach(v => databaseHints.add(v));
    extractFrontendHints(content).forEach(v => frontendHints.add(v));
    extractBackendHints(content).forEach(v => backendHints.add(v));
    extractDataPipelineHints(content).forEach(v => dataPipelineHints.add(v));
    sourceFiles.push({
      path: relPath,
      language: detectLanguage(relPath),
      size: Buffer.byteLength(content, 'utf8'),
      excerpt: truncate(content, 3000)
    });
  }

  return {
    workspaceRoot,
    repoName: path.basename(workspaceRoot),
    techStack: inferTechStack(packageInfo, sourceFiles),
    packageInfo,
    routeHints: [...routeHints].slice(0, 80),
    apiHints: [...apiHints].slice(0, 80),
    databaseHints: [...databaseHints].slice(0, 80),
    frontendHints: [...frontendHints].slice(0, 80),
    backendHints: [...backendHints].slice(0, 80),
    dataPipelineHints: [...dataPipelineHints].slice(0, 80),
    sourceFiles,
    policyPacks,
    config
  };
}

export async function writeRepoMap(repo: RepoContext): Promise<string> {
  const outputDir = path.join(repo.workspaceRoot, repo.config.outputRoot, 'context');
  await ensureDir(outputDir);
  const outputPath = path.join(outputDir, 'repo-map.md');
  const markdown = renderRepoMap(repo);
  await fs.writeFile(outputPath, markdown, 'utf8');
  return outputPath;
}

export function renderRepoMap(repo: RepoContext): string {
  const files = repo.sourceFiles.map(f => `- ${f.path} (${f.language}, ${f.size} bytes)`).join('\n');
  return `# Repository Map\n\n## Repository\n\n- Name: ${repo.repoName}\n- Tech Stack: ${repo.techStack.join(', ') || 'Unknown'}
- Policy Packs Loaded: ${repo.policyPacks.files.length}\n\n## Routes\n\n${repo.routeHints.map(x => `- ${x}`).join('\n') || '- None detected'}\n\n## API Hints\n\n${repo.apiHints.map(x => `- ${x}`).join('\n') || '- None detected'}\n\n## Frontend Hints\n\n${repo.frontendHints.map(x => `- ${x}`).join('\n') || '- None detected'}\n\n## Backend Hints\n\n${repo.backendHints.map(x => `- ${x}`).join('\n') || '- None detected'}\n\n## Database Hints\n\n${repo.databaseHints.map(x => `- ${x}`).join('\n') || '- None detected'}\n\n## Data Pipeline Hints\n\n${repo.dataPipelineHints.map(x => `- ${x}`).join('\n') || '- None detected'}\n\n## Files\n\n${files}\n`;
}

async function readPackageHints(root: string): Promise<string | undefined> {
  const candidates = ['package.json', 'pom.xml', 'build.gradle', 'settings.gradle', 'requirements.txt', 'pyproject.toml', 'poetry.lock', 'go.mod', 'openapi.yaml', 'openapi.yml', 'application.yml', 'application.yaml', 'application.properties', 'dbt_project.yml'];
  const parts: string[] = [];
  for (const candidate of candidates) {
    const text = await readTextIfExists(path.join(root, candidate));
    if (text) {
      parts.push(`## ${candidate}\n${truncate(text, 4000)}`);
    }
  }
  return parts.join('\n\n') || undefined;
}

async function collectFiles(root: string, maxFiles: number): Promise<string[]> {
  const result: string[] = [];
  await walk(root, result, maxFiles);
  return result.sort(sortByRelevance).slice(0, maxFiles);
}

async function walk(dir: string, result: string[], maxFiles: number): Promise<void> {
  if (result.length > maxFiles * 3) return;
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) {
        await walk(path.join(dir, entry.name), result, maxFiles);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SOURCE_EXTENSIONS.has(ext)) {
        const fullPath = path.join(dir, entry.name);
        const stat = await fs.stat(fullPath).catch(() => undefined);
        if (stat && stat.size < 300_000) result.push(fullPath);
      }
    }
  }
}

function sortByRelevance(a: string, b: string): number {
  const score = (p: string) => {
    const normalized = normalizePath(p).toLowerCase();
    let s = 0;
    if (normalized.includes('/src/')) s += 10;
    if (normalized.includes('/pages/') || normalized.includes('/routes/')) s += 10;
    if (normalized.includes('/components/')) s += 8;
    if (normalized.includes('/api/') || normalized.includes('/service')) s += 7;
    if (normalized.includes('/controller') || normalized.includes('/repository') || normalized.includes('/entity')) s += 7;
    if (normalized.includes('/pages/') || normalized.includes('/components/') || normalized.includes('/hooks/')) s += 7;
    if (normalized.includes('/styles/') || normalized.includes('/theme') || normalized.includes('/tokens') || normalized.includes('/design')) s += 9;
    if (normalized.endsWith('tailwind.config.js') || normalized.endsWith('tailwind.config.ts') || normalized.endsWith('vite.config.ts')) s += 8;
    if (normalized.includes('/sql/') || normalized.includes('/models/') || normalized.includes('/migrations/')) s += 7;
    if (normalized.endsWith('package.json')) s += 6;
    if (normalized.includes('/test') || normalized.includes('.test.')) s -= 5;
    return s;
  };
  return score(b) - score(a) || a.localeCompare(b);
}

function inferTechStack(packageInfo: string | undefined, files: RepoFileSummary[]): string[] {
  const text = `${packageInfo ?? ''}\n${files.map(f => f.path).join('\n')}`.toLowerCase();
  const stack: string[] = [];
  const addIf = (needle: string, label: string) => {
    if (text.includes(needle)) stack.push(label);
  };
  addIf('react', 'React');
  addIf('vue', 'Vue');
  addIf('angular', 'Angular');
  addIf('vite', 'Vite');
  addIf('next', 'Next.js');
  addIf('redux', 'Redux');
  addIf('mui', 'Material UI');
  addIf('tailwind', 'TailwindCSS');
  addIf('fastapi', 'FastAPI');
  addIf('spring-boot', 'Spring Boot');
  addIf('springframework', 'Spring Framework');
  addIf('jpa', 'Spring Data JPA');
  addIf('mybatis', 'MyBatis');
  addIf('postgres', 'PostgreSQL');
  addIf('maxcompute', 'MaxCompute');
  addIf('odps', 'MaxCompute / ODPS');
  addIf('bigquery', 'BigQuery');
  addIf('oracle', 'Oracle');
  addIf('dbt', 'dbt');
  addIf('airflow', 'Airflow');
  addIf('spark', 'Spark');
  addIf('mongodb', 'MongoDB');
  addIf('pytest', 'pytest');
  addIf('playwright', 'Playwright');
  return [...new Set(stack)];
}
