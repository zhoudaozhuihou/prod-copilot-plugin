---
name: prompt-input-optimizer
description: Use this skill whenever a user gives raw, vague, incomplete, or multi-part input to any product-dev command. It improves the request before execution by recognizing intent, injecting active editor and attachment context, preserving constraints, asking missing-context questions, generating concise/balanced/detailed prompt variants, and binding the result to the command output schema without inventing facts.
appliesTo: '*'
triggers: prompt optimization, user input, raw prompt, vague request, attachment, context, optimize prompt, 输入优化, 提示词优化, 附件上下文
---

# Prompt Input Optimizer Skill

## When to use

Use this skill before executing any command that depends on user-provided natural language. It is especially important for `/nl2sql`, `/sql-review`, `/sql-translate`, `/design-md`, `/frontend`, `/springboot`, `/python`, `/data`, `/dq`, `/review`, `/prompt`, `/summarize`, and `/compress`.

## Workflow

1. Preserve the original user request.
2. Detect the command intent and domain template.
3. Read available context from active editor, selected text, repository scan, policy packs, skills, and Chat attachments.
4. Convert the request into a structured execution brief:
   - Role
   - Objective
   - Scope
   - Required context
   - Constraints
   - Expected output
   - Quality bar
   - Missing questions
   - Do-not rules
5. Generate Concise, Balanced, and Detailed variants.
6. Pass the Balanced variant into the downstream command prompt.

## Safety Boundaries

- Do not invent table names, fields, quality thresholds, privacy classifications, or release gates.
- Do not ignore attachments when they are present.
- Do not use binary attachment content unless it can be safely decoded as text.
- When context is missing, ask targeted questions and mark assumptions explicitly.

## Output Behavior

The optimized prompt must be visible in the command artifact under an `Optimized User Input` section so users can audit how their raw request was interpreted.
