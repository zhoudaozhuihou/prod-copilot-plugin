# Python API Tests Prompt

Read Python FastAPI or Flask backend code and generate API test request examples and automation tests.

## Code reading priorities
1. Route decorators and router prefixes.
2. Pydantic / Marshmallow / request schema models.
3. Dependency injection and auth/security guards.
4. Exception handlers and HTTPException branches.
5. Service calls and repository side effects.

## Test output requirements
- Generate `.http` requests with variables.
- Generate cURL examples.
- Generate Postman collection snippet.
- Generate pytest tests with FastAPI TestClient or httpx AsyncClient.
- Include validation, authorization, not-found, conflict, duplicate, and idempotency scenarios.
