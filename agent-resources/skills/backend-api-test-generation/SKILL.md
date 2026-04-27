---
name: backend-api-test-generation
description: Generate executable API request examples and automated API tests from backend source code. Use this skill when the user asks to read Java Spring Boot, FastAPI, or Flask code and produce .http, cURL, Postman, Insomnia, MockMvc, RestAssured, JUnit, pytest, or httpx API tests.
---

# Backend API Test Generation Skill

Use this skill to convert backend implementation evidence into executable API test assets.

## Trigger examples

- Generate API test requests from Spring Boot code.
- Read controller logic and create MockMvc tests.
- Create Postman examples from FastAPI routes.
- Generate .http files from backend code.
- Review whether API tests cover validation, auth, and service branches.

## Process

1. **Collect evidence**
   - Read selected files, attachments, active editor context, and repository code.
   - Prefer Controller/router files, DTO/schema files, validation annotations, security annotations, exception handlers, and service methods.

2. **Build endpoint inventory**
   - Identify method, path, handler, parameters, body type, auth requirements, validation rules, and expected side effects.

3. **Design test matrix**
   - Include positive, negative, validation, boundary, auth, permission, conflict, duplicate, not-found, idempotency, and service-branch scenarios.

4. **Generate executable requests**
   - Provide `.http`, cURL, HTTPie, Postman, and Insomnia examples with environment variables.

5. **Generate automation tests**
   - Spring Boot: MockMvc/RestAssured/JUnit 5.
   - Python: pytest/httpx/FastAPI TestClient.

6. **Identify gaps**
   - Never invent unclear request fields or response shapes. Ask targeted questions or mark assumptions.

## Guardrails

- Do not generate tests unrelated to scanned endpoints.
- Do not hardcode production secrets or real customer data.
- Use synthetic test data.
- For banking systems, include authorization, audit, privacy, data consistency, and rollback-relevant checks.
