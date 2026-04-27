---
name: springboot-engineering
description: Use this skill for Java Spring Boot backend design and review, including controller/DTO/service/repository layering, validation, transaction boundaries, security, audit logging, OpenAPI contracts, integration tests, error handling, idempotency, and production configuration.
appliesTo: backend,springboot,api,review,test
triggers: java,spring,springboot,jvm
---

# Spring Boot Engineering

## Karpathy Execution Guardrails

Apply the shared `karpathy-guidelines` skill for non-trivial work:

- State assumptions before designing or changing anything.
- Prefer the smallest useful artifact over speculative completeness.
- Keep changes surgical and trace every recommendation to the user request or evidence.
- Convert the task into verifiable success criteria before calling it done.
- If project policy, user intent, or repository evidence is unclear, ask targeted questions instead of guessing.

Use layered architecture: Controller, DTO, validation, Service, Repository, Entity, Mapper, Exception, Config, Test. Check transaction boundaries, idempotency, security annotations, audit logging, OpenAPI alignment, integration tests, and environment profiles. Do not generate Python files for Java-only tasks.
