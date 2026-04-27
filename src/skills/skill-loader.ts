/**
 * Anthropic-style custom skill loader.
 *
 * Design principles:
 * - A skill is a directory with a required SKILL.md file.
 * - `name` and `description` frontmatter are treated as the portable discovery contract.
 * - `description` is the primary trigger signal; appliesTo/triggers remain optional compatibility fields.
 * - Bundled files under references/, scripts/, assets/, examples/, and evals/ are catalogued but not blindly
 *   injected into every prompt. This preserves progressive disclosure and keeps token usage bounded.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ProductDevCommand } from '../core/types';
import { exists } from '../utils/fs-utils';
import { OptimizedUserInput } from '../prompt/user-input-optimizer';

export interface SkillResource {
  relativePath: string;
  type: 'reference' | 'script' | 'asset' | 'example' | 'eval' | 'other';
  size: number;
}

export interface SkillDefinition {
  name: string;
  description: string;
  appliesTo: string[];
  triggers: string[];
  path: string;
  directory: string;
  content: string;
  frontmatter: Record<string, string>;
  resources: SkillResource[];
  qualityWarnings: string[];
}

export async function loadSkills(workspaceRoot: string): Promise<SkillDefinition[]> {
  const roots = [
    path.join(workspaceRoot, '.product-dev', 'skills'),
    path.join(workspaceRoot, 'agent-resources', 'skills')
  ];

  const results: SkillDefinition[] = [];
  for (const root of roots) {
    if (!(await exists(root))) continue;
    const entries = await fs.readdir(root, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillDir = path.join(root, entry.name);
      const skillFile = path.join(skillDir, 'SKILL.md');
      if (!(await exists(skillFile))) continue;
      const content = await fs.readFile(skillFile, 'utf8');
      const resources = await listSkillResources(skillDir, skillFile);
      results.push(parseSkill(entry.name, skillDir, skillFile, content, resources));
    }
  }

  const byName = new Map<string, SkillDefinition>();
  for (const skill of results) {
    if (!byName.has(skill.name)) byName.set(skill.name, skill);
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadApplicableSkills(workspaceRoot: string, command: ProductDevCommand, optimized: OptimizedUserInput): Promise<SkillDefinition[]> {
  const skills = await loadSkills(workspaceRoot);
  const text = `${command}\n${optimized.originalPrompt}\n${optimized.normalizedGoal}\n${optimized.detectedIntent}`.toLowerCase();
  return skills.filter(skill => {
    const applies = skill.appliesTo.includes('*') || skill.appliesTo.includes(command);
    const nameSuggested = optimized.suggestedSkills.includes(skill.name);
    const descriptionHit = tokenHit(skill.description, text);
    const triggerHit = skill.triggers.some(t => t && text.includes(t.toLowerCase()));
    return applies || nameSuggested || descriptionHit || triggerHit;
  }).slice(0, 5);
}

export function renderSkillsForPrompt(skills: SkillDefinition[]): string {
  if (!skills.length) {
    return '## Applied Custom Skills\n\n- No custom skill matched this command. Use `@product-dev /skill-init` to add Anthropic-style local skills.\n';
  }
  return `## Applied Custom Skills\n\n${skills.map(skill => renderOneSkill(skill)).join('\n\n')}`;
}

export function findSkillByName(skills: SkillDefinition[], requestedName: string): SkillDefinition | undefined {
  const normalized = requestedName.trim().toLowerCase();
  return skills.find(s => s.name.toLowerCase() === normalized || path.basename(s.directory).toLowerCase() === normalized);
}

export function renderSkillInventory(skills: SkillDefinition[], workspaceRoot: string): string {
  if (!skills.length) return 'No custom skills found.';
  const lines = ['| Skill | Discovery Description | Applies To | Resources | Warnings | Path |', '|---|---|---|---:|---|---|'];
  for (const skill of skills) {
    lines.push(`| ${escapePipe(skill.name)} | ${escapePipe(shorten(skill.description, 140))} | ${escapePipe(skill.appliesTo.join(', '))} | ${skill.resources.length} | ${escapePipe(skill.qualityWarnings.join('; ') || 'None')} | \`${path.relative(workspaceRoot, skill.path).replace(/\\/g, '/')}\` |`);
  }
  return lines.join('\n');
}

function renderOneSkill(skill: SkillDefinition): string {
  const warnings = skill.qualityWarnings.length ? `\n\nQuality warnings: ${skill.qualityWarnings.join('; ')}` : '';
  const resources = skill.resources.length
    ? `\n\nBundled resources available for progressive disclosure:\n${skill.resources.map(r => `- ${r.relativePath} (${r.type}, ${r.size} bytes)`).join('\n')}`
    : '';
  return `### ${skill.name}\n\nDescription: ${skill.description}\n\nApplies to: ${skill.appliesTo.join(', ')}${warnings}${resources}\n\nSkill instructions:\n${truncate(skill.content, 4200)}`;
}

function parseSkill(fallbackName: string, skillDir: string, skillPath: string, content: string, resources: SkillResource[]): SkillDefinition {
  const frontmatter = parseFrontmatter(content);
  const name = frontmatter.name || fallbackName;
  const description = frontmatter.description || '';
  const appliesTo = splitList(frontmatter.appliesTo || frontmatter.commands || inferAppliesTo(description));
  const triggers = splitList(frontmatter.triggers || frontmatter.keywords || inferTriggers(name, description));
  const body = stripFrontmatter(content).trim();
  const qualityWarnings = validateSkill(frontmatter, body, resources);
  return { name, description: description || 'Custom local skill', appliesTo, triggers, path: skillPath, directory: skillDir, content: body, frontmatter, resources, qualityWarnings };
}

function validateSkill(frontmatter: Record<string, string>, body: string, resources: SkillResource[]): string[] {
  const warnings: string[] = [];
  if (!frontmatter.name) warnings.push('Missing required frontmatter: name');
  if (!frontmatter.description) warnings.push('Missing required frontmatter: description');
  if ((frontmatter.description || '').length < 80) warnings.push('Description may be too weak for reliable triggering');
  const lines = body.split(/\r?\n/).length;
  if (lines > 500) warnings.push('SKILL.md body exceeds 500 lines; move detail to references/');
  if (!/when to use|use this skill|workflow|process|steps|output/i.test(body)) warnings.push('Body should explain workflow and output behavior');
  if (!/security|privacy|do not|avoid|permission|trusted|audit/i.test(body)) warnings.push('Consider adding safety/privacy boundaries');
  if (!resources.some(r => r.type === 'eval')) warnings.push('No evals/ resource found');
  return warnings;
}

function parseFrontmatter(content: string): Record<string, string> {
  if (!content.startsWith('---')) return {};
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  if (!match) return {};
  const body = match[1];
  const result: Record<string, string> = {};
  let currentKey: string | undefined;
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.replace(/\t/g, '  ');
    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      result[currentKey] = cleanYamlScalar(keyMatch[2]);
    } else if (currentKey && /^\s+/.test(line)) {
      result[currentKey] = `${result[currentKey]} ${cleanYamlScalar(line.trim())}`.trim();
    }
  }
  return result;
}

function cleanYamlScalar(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function stripFrontmatter(content: string): string {
  if (!content.startsWith('---')) return content;
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  return match ? content.slice(match[0].length) : content;
}

function splitList(value: string): string[] {
  return value.split(',').map(v => v.trim()).filter(Boolean);
}

function inferAppliesTo(description: string): string {
  const d = description.toLowerCase();
  const commands: string[] = [];
  for (const c of ['nl2sql','sql','sql-review','sql-translate','dq','reconcile','lineage','data-review','data','frontend','design-md','ui-design','springboot','python','backend','prompt','skill-review']) {
    if (d.includes(c.replace('-', ' ')) || d.includes(c)) commands.push(c);
  }
  return commands.length ? commands.join(',') : '*';
}

function inferTriggers(name: string, description: string): string {
  const words = `${name} ${description}`.toLowerCase().match(/[a-z0-9_\-]+|[\u4e00-\u9fa5]{2,}/g) || [];
  return [...new Set(words.filter(w => w.length > 2).slice(0, 20))].join(',');
}

function tokenHit(description: string, text: string): boolean {
  const tokens = inferTriggers('', description).split(',').filter(t => t.length >= 4);
  let hits = 0;
  for (const token of tokens) if (text.includes(token)) hits += 1;
  return hits >= Math.min(2, tokens.length);
}

async function listSkillResources(skillDir: string, skillFile: string): Promise<SkillResource[]> {
  const result: SkillResource[] = [];
  async function walk(current: string): Promise<void> {
    const entries = await fs.readdir(current, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (full === skillFile) continue;
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile()) {
        const stat = await fs.stat(full);
        const relativePath = path.relative(skillDir, full).replace(/\\/g, '/');
        result.push({ relativePath, type: classifyResource(relativePath), size: stat.size });
      }
    }
  }
  await walk(skillDir);
  return result.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

function classifyResource(relativePath: string): SkillResource['type'] {
  if (relativePath.startsWith('references/')) return 'reference';
  if (relativePath.startsWith('scripts/')) return 'script';
  if (relativePath.startsWith('assets/')) return 'asset';
  if (relativePath.startsWith('examples/')) return 'example';
  if (relativePath.startsWith('evals/')) return 'eval';
  return 'other';
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}\n\n...[truncated skill content; inspect bundled references for details]` : value;
}

function shorten(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function escapePipe(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
