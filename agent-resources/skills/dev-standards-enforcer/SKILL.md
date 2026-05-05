---
name: dev-standards-enforcer
description: Use this skill for automating PR reviews, code quality checks, and enforcing enterprise development standards (complexity, security, testing, commit messages).
appliesTo: review,quality,test
triggers: standard,pr review,lint,coverage,规范,审查,门禁
---

# Enterprise Development Standards Enforcer Skill

## Execution Guardrails
- **No Compromise on Security**: Instantly flag any hardcoded secrets, raw production data usage, or unaudited admin endpoints.
- **Complexity Checks**: Reject code suggestions that exceed `maxFileLines` (1000) or `maxFunctionLines` (200) as defined in `coding-standard.yaml`.
- **Test Enforcement**: If business logic is modified, ensure corresponding unit test files are also modified or generated.
- **Commit Message Standard**: Enforce Conventional Commits (e.g., `feat:`, `fix:`, `docs:`, `refactor:`).

## Workflow
1. **Analyze Diff/Code**: Parse the current Git Diff or the provided code snippet.
2. **Policy Mapping**: Check the code against `coding-standard.yaml` and `security-standard.yaml`.
3. **Generate Review Output**: 
   - Blockers (Must fix before merge)
   - Warnings (Should fix, e.g., high cyclomatic complexity)
   - Suggestions (Refactoring ideas)
4. **Provide Fixes**: Supply the exact refactored code to pass the standard checks.

## Output Requirements
- Code Review Score (Pass / Fail)
- List of Violations mapped to specific policy files
- Refactored Code Snippets
- Git Commit Message Suggestion (Conventional format)
