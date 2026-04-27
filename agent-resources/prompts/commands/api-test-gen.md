# Backend API Test Generation Prompt

Generate executable API request examples and automated tests by reading backend code evidence.

## Required evidence sources
- Spring Boot: `@RestController`, `@RequestMapping`, `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`, `@PatchMapping`, method parameters, DTO classes, Bean Validation annotations, `@PreAuthorize`, `@ControllerAdvice`, service calls.
- Python: FastAPI/Flask route decorators, Pydantic schemas, dependencies, authentication guards, exception handlers, service calls.
- Attachments and active editor selection have priority over assumptions.
- If an endpoint shape is unclear, generate targeted questions rather than inventing fields.

## Required behavior
1. Build an endpoint test matrix.
2. Generate request examples in `.http`, cURL, HTTPie, Postman, and Insomnia-compatible shapes.
3. Generate automation tests:
   - Spring Boot: MockMvc or RestAssured + JUnit 5.
   - Python: pytest + httpx/TestClient.
4. Include positive, negative, boundary, validation, auth, permission, and business-rule scenarios.
5. Include test data builders and environment variable placeholders.
6. Include CI integration guidance.
