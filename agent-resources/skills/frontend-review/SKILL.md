---
name: frontend-review
description: Use this skill for frontend product engineering and review tasks involving React, Vue, Angular, page flows, route design, components, state management, API hooks, forms, loading/error/empty states, accessibility, telemetry, performance, and frontend tests. Trigger when the user asks for UI implementation, frontend review, journey analysis, or product experience improvements.
appliesTo: frontend,journey,review,test
triggers: react,vue,angular,frontend,ui,页面,组件
---

# Frontend Review

## Karpathy Execution Guardrails

Apply the shared `karpathy-guidelines` skill for non-trivial work:

- State assumptions before designing or changing anything.
- Prefer the smallest useful artifact over speculative completeness.
- Keep changes surgical and trace every recommendation to the user request or evidence.
- Convert the task into verifiable success criteria before calling it done.
- If project policy, user intent, or repository evidence is unclear, ask targeted questions instead of guessing.

Check page purpose, route behavior, component boundaries, state ownership, API hooks, form validation, loading/empty/error/permission states, accessibility, responsive behavior, performance, telemetry, unit tests, component tests, and E2E tests. Tie findings back to product journey and user friction.
