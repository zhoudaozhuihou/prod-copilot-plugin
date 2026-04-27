# Ralph Loop Design

This extension implements a conservative Ralph-style loop for enterprise VS Code usage.

## Why external state

Long-running agent sessions can lose reliability when all progress is kept only in chat context. The loop writes progress into explicit local files:

- `.product-dev/ralph-loop.local.json`
- `.product-dev/RALPH_LOOP_TODO.md`

## Commands

- `/loop <task>` creates loop state and runs the first safe iteration by default.
- `/loop-next` runs the next pending command.
- `/loop-status` shows current sequence, completed steps, and next command.
- `/loop-stop` stops the active loop.

## Guided vs auto

Default is guided mode. Set `companyProductDev.ralphAutoRun` to `true` if your environment allows multiple AI iterations in one command.

## Completion criteria

The loop is complete only when requirements, designs, tasks, tests, quality gates, review, diff impact, release readiness, rollback, and monitoring are documented.
