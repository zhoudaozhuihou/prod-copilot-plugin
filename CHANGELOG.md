
## 1.7.0 - Diagram Workflow Edition

- Added `/architecture-diagram`, `/journey-diagram`, and `/diagram`.
- Added diagram-aware output schemas to major SDLC commands.
- Added Anthropic-style `diagramming` skill with Mermaid standards and diagram catalog.
- Added Copilot/OpenCode prompt shims and `diagram-architect` subagent.
- Added documentation in `docs/DIAGRAM_WORKFLOW_V1_7.md`.

# Changelog

## v1.5.0 - Karpathy-Guided Skills Edition

- Added `karpathy-guidelines` portable skill.
- Added compact execution contract reference to every domain skill.
- Updated system prompt and AGENTS.md for OpenCode-compatible execution behavior.
- Added portable command prompts for Karpathy guideline checks.
- Added documentation in `docs/KARPATHY_SKILL_OPTIMIZATION.md`.

## v1.4.0 - Ralph PRD & Loop Skills Edition

- Upgraded `/prd` prompts and output schema for Ralph-style small, dependency-aware, independently verifiable user stories.
- Added `/story-split` command to split PRDs and feature designs into one-iteration stories.
- Added `/prd-json` command to convert PRDs into Ralph-compatible `prd.json` content with stable IDs, priorities, `passes:false`, and verifiable acceptance criteria.
- Added `/ralph-readiness` command to review whether the PRD, `prd.json`, `progress.txt`, AGENTS/CLAUDE memory, and quality commands are safe for loop execution.
- Added Anthropic-style skills: `prd-planning`, `ralph-prd`, and `ralph-loop`.
- Added portable prompts and output schemas under `agent-resources/` and project-level overrides under `.product-dev/prompts`.
- Added OpenCode and GitHub prompt shims for PRD JSON, story splitting, and Ralph readiness.
- Added `scripts/ralph/` templates: `prd.json.example`, `progress.txt`, `prompt.md`, `CLAUDE.md`, and `ralph.sh`.
- Updated workflow ordering so PRD-related work recommends `/story-split` → `/prd-json` → `/ralph-readiness` → `/loop`.

## 1.1.0 - Anthropic-Style Skills Edition

## 1.3.0 - Prompt Optimizer Attachment Context Edition

- Added command-wide prompt optimization inspired by copilot-prompt-optimizer: intent recognition, context awareness, concise/balanced/detailed variants, output schema binding, and missing-context questions.
- Added request context collection from active editor, selected code, surrounding code, Chat attachments, and VS Code Chat references.
- Added `/attachments` command to show what context the extension can read.
- Added portable prompt and Anthropic-style skill assets for prompt-input-optimizer under agent-resources/.
- Updated all model-backed workflow commands to inject optimized user input and attachment context before final prompt compilation.


- Reworked local and portable skills to use Anthropic-style `SKILL.md` structure.
- Added `skill-creator`, `sql-translate`, and stronger SQL/NL2SQL/SQL Review skills.
- Added `references/` and `evals/` resources for progressive disclosure and skill testing.
- Improved skill loader to treat `name` and `description` as primary discovery metadata.
- Improved `/skill-scan` and `/skill-review` to report triggering, resource, eval, and safety quality.
- Updated `/skill-init` and `/resources-init` to generate higher-quality, OpenCode-compatible skills.

# Changelog

## 0.9.0 - Prompt Optimizer & Skills Edition

- Added deterministic UserInputOptimizer for all major AI artifact commands.
- Added local custom skill registry under .product-dev/skills/.
- Added /skill-init, /skill-scan, /skill-run, and /skill-review commands.
- Added default skills for prompt quality, bank data engineering, frontend review, Spring Boot engineering, and Python engineering.
- Updated /init to generate custom skill structure in addition to Copilot/opencode and Policy Pack assets.
- Added prompt/skill documentation and README usage rules.

## v0.8.0 - Stack Driven Init Edition

- Fixed /init over-generation: Java/Spring Boot no longer creates Python backend folders.
- Fixed /init over-generation: Python/FastAPI no longer creates Java backend folders.
- Fixed data init over-generation: PostgreSQL/Oracle/BigQuery/MaxCompute folders are generated only when explicitly requested.
- Added stack parser for frontend, backend, data engines, Copilot, and opencode.
- Added decision-required mode for ambiguous init prompts.
- Added Copilot repository instructions, prompt files, stack-specific instruction files, and VS Code recommendations.
- Added opencode/agent assets: AGENTS.md, .opencode/opencode.jsonc, .opencode/agents, and .opencode/commands.
- Added docs/INIT_TECH_STACK_GUIDE.md.

## v0.7.0 - Documented Policy Pack Edition

- Rewrote README into a complete Chinese usage guide.
- Added `docs/USAGE_RULES.md` for team-level usage rules.
- Added `docs/DEVELOPER_GUIDE.md` for maintainers.
- Added `docs/POLICY_PACK_GUIDE.md` for company/department/country/project/environment rule overlays.
- Added `docs/SOURCE_CODE_COMMENTARY.md` explaining the execution path and core source files.
- Expanded `docs/command-reference.md` from package command metadata.
- Added file-level explanatory comments to every TypeScript source file.
- Added function-level comments to key execution files: participant, shared command pipeline, policy loader, and project initializer.
- Updated package metadata to v0.7.0.

## v0.6.0 - Policy Pack Overlay

- Added local Policy Pack overlay directories.
- Added `/policy-init`, `/policy-intake`, `/policy-scan`, `/policy-review`.
- Added company/department/country/project/environment rule precedence.

## v0.5.0 - Bank Data Engineering Pack + Interactive Init

- Added interactive `/init` tracks for frontend, backend, data, fullstack.
- Added `/intake` and `/context`.
- Added bank data engineering commands including data contract, STTM, DQ, reconciliation, lineage, scheduler, privacy, data-test, data-review, semantic, cost, runbook.

## v0.4.0 - Tool Commands

- Added `/prompt`, `/summarize`, `/compress`, `/doc-review`, `/rewrite`, `/checklist`.

## v0.3.0 - Enterprise Prompt + Ralph Loop

- Added enhanced system prompts.
- Added ordered workflow planning.
- Added Ralph-style loop commands.

## v0.2.0 - Fullstack + Data Development

- Added frontend, backend, Spring Boot, Python, SQL, schema, pipeline, and quality commands.

## v0.1.0 - Initial Product Workflow

- Initial `@product-dev` participant and product workflow commands.

## 1.0.0 - OpenCode Compatible SQL Edition

- Added portable prompt/skill source-of-truth under `agent-resources/`.
- Added project prompt overrides under `.product-dev/prompts/`.
- Added `/resources-init` and `/resources-scan` commands.
- Added `/nl2sql` for natural-language-to-SQL.
- Enhanced `/sql-translate` for PostgreSQL, Oracle, BigQuery, MaxCompute/ODPS, MySQL, SQL Server, Snowflake, Databricks/Spark SQL, and Hive.
- Added `/sql-review` for production SQL review.
- Added OpenCode shims for SQL commands and `sql-engineer` agent.
- Updated `/init` to generate portable Copilot/OpenCode resources for selected stacks.

## 1.2.0 - DESIGN.md UI Edition

- Added `/design-md` command to read an existing frontend project and generate a Stitch-compatible root `DESIGN.md`.
- Added `/ui-design` command to generate implementation-ready UI design guidance from `DESIGN.md` or user visual direction.
- Added Anthropic-style `design-md` skill with references, evals, and frontend evidence checklist.
- Added OpenCode and Copilot shims for portable DESIGN.md workflow.
- Updated `/init frontend` to generate a starter `DESIGN.md` placeholder.
- Extended repository scanner to include CSS/SCSS/Sass/Less/HTML and theme/design files.

## 1.6.0 - VS Code Copilot Subagent Orchestration

- Added `/agents-init` and `/agents-scan` commands.
- Added `.github/agents/*.agent.md` workspace custom agents for VS Code Copilot native subagents.
- Added `product-dev-coordinator` plus specialized worker agents for PRD, UI, frontend, Spring Boot, Python, SQL, bank data engineering, quality, security, and release.
- Added `agent-resources/skills/subagent-orchestration/` and `agent-resources/prompts/commands/subagent-orchestration.md`.
- Added subagent delegation guidance to every complex model-backed command.
- Added OpenCode-compatible `.opencode/commands/subagent-plan.md` for future migration.
