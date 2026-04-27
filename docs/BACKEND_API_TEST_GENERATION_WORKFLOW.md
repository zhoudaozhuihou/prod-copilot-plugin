# Backend API Test Generation Workflow

This workflow reads backend source code and generates API request examples plus automated test cases.

## Commands

```text
@product-dev /backend-api-scan
@product-dev /api-test-gen
@product-dev /springboot-api-tests
@product-dev /python-api-tests
```

## Recommended Spring Boot workflow

```text
@product-dev /backend-api-scan
@product-dev /springboot-api-tests 基于当前 Java Spring Boot Controller、DTO、Validation、Security 生成 API 测试请求和 JUnit 测试
@product-dev /test
@product-dev /quality
@product-dev /review
```

## Recommended Python workflow

```text
@product-dev /backend-api-scan
@product-dev /python-api-tests 基于当前 FastAPI/Flask route、Pydantic schema、依赖和异常处理生成 API 测试请求和 pytest 测试
@product-dev /test
@product-dev /quality
@product-dev /review
```

## What the scanner reads

### Spring Boot

- `@RestController`
- `@RequestMapping`, `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`, `@PatchMapping`
- `@PathVariable`, `@RequestParam`, `@RequestBody`
- DTO classes and Bean Validation annotations
- `@PreAuthorize`, `@Secured`, `@RolesAllowed`
- Service method calls
- Exception mapping hints

### Python

- FastAPI `@router.get/post/...`
- Flask `@app.route`
- Pydantic / schema hints
- Auth dependencies
- Service calls

## Generated assets

The model command writes:

```text
docs/test/backend-api-code-scan.md
docs/test/api-test-requests.md
docs/test/springboot-api-tests.md
docs/test/python-api-tests.md
```

## Expected output

- Endpoint test matrix
- `.http` request examples
- cURL and HTTPie examples
- Postman / Insomnia snippets
- Positive and negative test cases
- Validation and auth cases
- Spring Boot MockMvc / RestAssured / JUnit 5 tests
- Python pytest / httpx tests
- CI integration guidance

## Governance notes

For bank projects, API tests must include authorization, validation, audit-sensitive behavior, synthetic data only, data privacy checks, and negative scenarios for invalid user roles.
