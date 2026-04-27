# Spring Boot API Tests Prompt

Read Java Spring Boot backend code and generate API test request examples and automation tests.

## Code reading priorities
1. Class-level and method-level mappings.
2. DTO/request/response classes and Bean Validation annotations.
3. Security annotations and filters.
4. `@ControllerAdvice` exception mapping.
5. Service calls and branch hints.
6. Persistence side effects and transaction boundaries.

## Test output requirements
- Generate `.http` requests with variables.
- Generate cURL examples.
- Generate Postman collection snippet.
- Generate MockMvc tests when controller slice testing is appropriate.
- Generate RestAssured tests when end-to-end HTTP testing is appropriate.
- Include JUnit 5 test data builders.
- Include validation, authorization, not-found, conflict, duplicate, and idempotency scenarios.
