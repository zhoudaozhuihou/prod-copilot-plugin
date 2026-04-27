# Ralph Memory Files

## prd.json

Source of truth for story state. `passes:false` means pending. `passes:true` means completed with evidence.

## progress.txt

Append-only iteration log. Must preserve:

- story ID
- what changed
- files changed
- quality checks run
- reusable learnings
- blockers and follow-up notes

## AGENTS.md / CLAUDE.md

Only add reusable patterns, gotchas, or conventions that future agents should know.
