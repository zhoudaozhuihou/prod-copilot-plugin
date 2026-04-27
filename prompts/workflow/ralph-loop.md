# Ralph-style Loop Prompt Contract

A Ralph-style loop is an iterative delivery technique. The loop must rely on external state instead of assuming one long chat context.

## State Files

- `.product-dev/ralph-loop.local.json`: active status, current iteration, max iterations, completed commands, next command.
- `.product-dev/RALPH_LOOP_TODO.md`: human-readable checklist and completion criteria.

## Iteration Rules

1. Read current state.
2. Pick the next incomplete command.
3. Complete one meaningful step.
4. Write an artifact.
5. Update state.
6. Recommend the next command.
7. Stop when max iterations are reached or all required commands are done.

## Completion Marker

Use `ALL_TASKS_COMPLETE` only after design, implementation plan, tests, quality gates, review, diff, release readiness, rollback, and monitoring are documented.
