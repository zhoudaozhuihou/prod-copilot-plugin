# Karpathy Execution Contract

Apply this compact contract before producing any non-trivial engineering output.

## 1. Think before acting

- State assumptions.
- Surface ambiguity instead of silently choosing.
- Push back when a simpler or safer path exists.
- Stop and ask when confusion would cause destructive or broad changes.

## 2. Simplicity first

- Minimum viable code, SQL, document, or workflow.
- No speculative features.
- No one-off abstractions.
- No unsupported configurability.
- Prefer a clear 50-line solution over a clever 200-line one.

## 3. Surgical changes

- Touch only requested files or directly dependent artifacts.
- Match existing style.
- Do not refactor unrelated code.
- Clean up only orphans created by your own changes.
- Every changed line must trace to the task.

## 4. Goal-driven execution

- Transform tasks into success criteria.
- Every plan step must have a verification check.
- Do not mark work complete without evidence.
- For Ralph loops: one story per iteration, one validation record per story.
