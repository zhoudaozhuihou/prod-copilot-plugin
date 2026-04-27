---
name: karpathy-guidelines
description: Behavioral execution guidelines for AI coding and engineering agents. Use whenever writing, reviewing, refactoring, planning, or iterating on code, SQL, PRD stories, frontend UI, backend services, data pipelines, or tool prompts to avoid wrong assumptions, overengineering, broad side effects, and unverifiable outputs.
license: MIT
appliesTo: *,prd,feature,story-split,frontend,backend,springboot,python,data,sql,nl2sql,sql-review,sql-translate,dq,reconcile,lineage,review,test,diff,release,loop,loop-next,skill-run
triggers: coding,review,refactor,fix,implement,sql,prd,loop,karpathy,simple,surgical,verification,验收,验证,简化,改动
---

# Karpathy Guidelines Skill

Behavioral guidelines to reduce common AI coding and engineering mistakes. Apply this skill as a lightweight execution contract, not as a replacement for domain skills or company policy packs.

## When to use

Use this skill for non-trivial engineering work: code generation, code review, SQL design, NL2SQL, PRD story splitting, Ralph loop iterations, frontend/backend/data implementation, migration, release, or any task where hidden assumptions, scope creep, or broad edits could cause risk.

For trivial one-line edits, use judgment and keep the output short.

## Core principles

1. **Think before acting.** State assumptions explicitly. If multiple interpretations are plausible, list them and ask or choose the safest narrow interpretation with a visible assumption.
2. **Simplicity first.** Produce the minimum design, code, SQL, or document that solves the stated problem. Do not add speculative features, abstractions, or configurability.
3. **Surgical changes.** Touch only what the task requires. Match existing project style. Do not refactor adjacent code, rename unrelated fields, or “improve” unrelated content.
4. **Goal-driven execution.** Convert every task into verifiable success criteria and loop only until those criteria are met.

## Required execution pattern

For every substantial output, include:

- **Assumptions:** what you believe is true based on user input, files, attachments, policy packs, and repo context.
- **Minimal scope:** what is included and explicitly not included.
- **Plan with verification:** 2-5 steps, each with a concrete verification check.
- **Surgical change rule:** identify which files/artifacts should change and which should not.
- **Success criteria:** tests, typecheck, lint, SQL validation, DQ, reconciliation, UI verification, or review checklist.
- **Open questions:** only questions that block safe progress.

## Pushback rule

Push back when the user asks for a broad rewrite, unnecessary abstraction, unsafe SQL, unclear data access, destructive migration, or unverifiable release. Offer a smaller safer version.

## Output pattern

Task interpretation → assumptions → minimal plan → verification checks → implementation/review output → risks/open questions → next command.

## References

Read `references/execution-contract.md` for the compact rules used by other skills.
Read `references/verification-patterns.md` for domain-specific success criteria.
