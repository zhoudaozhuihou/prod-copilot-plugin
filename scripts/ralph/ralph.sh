#!/usr/bin/env bash
set -euo pipefail
TOOL="${1:-opencode}"
MAX_ITERATIONS="${2:-10}"
for i in $(seq 1 "$MAX_ITERATIONS"); do
  echo "Ralph iteration $i/$MAX_ITERATIONS using $TOOL"
  case "$TOOL" in
    opencode) opencode run < scripts/ralph/prompt.md ;;
    claude) claude -p "$(cat scripts/ralph/CLAUDE.md)" ;;
    amp) amp < scripts/ralph/prompt.md ;;
    *) echo "Unsupported tool: $TOOL"; exit 1 ;;
  esac
  if grep -q '"passes": false' scripts/ralph/prd.json 2>/dev/null; then
    continue
  fi
  echo "COMPLETE"
  exit 0
done
