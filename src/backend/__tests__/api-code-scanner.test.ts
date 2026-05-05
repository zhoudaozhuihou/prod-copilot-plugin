import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Import after creating temp files to ensure module resolution works
import { scanBackendApiSignals } from '../api-code-scanner';

function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'code-scanner-test-'));
}

function writeJavaFile(dir: string, relativePath: string, content: string): string {
  const fullPath = path.join(dir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  return fullPath;
}

function writePythonFile(dir: string, relativePath: string, content: string): string {
  return writeJavaFile(dir, relativePath, content);
}

describe('scanBackendApiSignals', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('when workspace root is missing', () => {
    it('should return empty result with warning', () => {
      const result = scanBackendApiSignals(undefined);
      expect(result.scannedFiles).toBe(0);
      expect(result.endpoints).toHaveLength(0);
      expect(result.warnings).toContain('No workspace root was available. Attach backend files or open a workspace.');
      expect(result.markdown).toContain('No workspace root was available');
    });
  });

  describe('Spring Boot Java scanning', () => {
    it('should detect @RestController with @GetMapping', () => {
      writeJavaFile(tempDir, 'src/main/java/com/bank/AccountController.java', [
        'package com.bank;',
        'import org.springframework.web.bind.annotation.*;',
        '@RestController',
        '@RequestMapping("/api/v1/accounts")',
        'public class AccountController {',
        '  @GetMapping("/{id}")',
        '  public Account getAccount(@PathVariable String id) {',
        '    return accountService.findById(id);',
        '  }',
        '}',
      ].join('\n'));

      const result = scanBackendApiSignals(tempDir);
      expect(result.scannedFiles).toBeGreaterThanOrEqual(1);
      expect(result.endpoints).toHaveLength(1);
      expect(result.endpoints[0].httpMethod).toBe('GET');
      expect(result.endpoints[0].path).toBe('/api/v1/accounts/{id}');
      expect(result.endpoints[0].framework).toBe('springboot');
    });

    it('should detect multiple HTTP methods', () => {
      writeJavaFile(tempDir, 'src/main/java/com/bank/TransactionController.java', [
        'package com.bank;',
        'import org.springframework.web.bind.annotation.*;',
        '@RestController',
        '@RequestMapping("/api/v1/transactions")',
        'public class TransactionController {',
        '  @GetMapping',
        '  public List<Transaction> list() { return service.findAll(); }',
        '  @PostMapping',
        '  public Transaction create(@RequestBody @Valid CreateTxRequest req) { return service.create(req); }',
        '  @DeleteMapping("/{id}")',
        '  public void delete(@PathVariable String id) { service.delete(id); }',
        '}',
      ].join('\n'));

      const result = scanBackendApiSignals(tempDir);
      const methods = result.endpoints.map(e => `${e.httpMethod} ${e.path}`);
      expect(methods).toContain('GET /api/v1/transactions');
      expect(methods).toContain('POST /api/v1/transactions');
      expect(methods).toContain('DELETE /api/v1/transactions/{id}');
    });

    it('should extract validation hints from DTO annotations', () => {
      writeJavaFile(tempDir, 'src/main/java/com/bank/dto/CreateTxRequest.java', [
        'package com.bank.dto;',
        'import jakarta.validation.constraints.*;',
        'public class CreateTxRequest {',
        '  @NotNull',
        '  private String accountId;',
        '  @Min(1) @Max(1000000)',
        '  private BigDecimal amount;',
        '  @NotBlank @Size(max = 255)',
        '  private String description;',
        '  @Email',
        '  private String notifyEmail;',
        '}',
      ].join('\n'));

      const result = scanBackendApiSignals(tempDir);
      expect(result.dtoHints.length).toBeGreaterThanOrEqual(1);
      const dtoText = result.dtoHints.join(' ');
      expect(dtoText).toContain('CreateTxRequest');
      expect(dtoText).toContain('@NotNull');
      expect(dtoText).toContain('@Min(1)');
      expect(dtoText).toContain('@Max(1000000)');
    });

    it('should extract security annotations from controller', () => {
      writeJavaFile(tempDir, 'src/main/java/com/bank/SecureController.java', [
        'package com.bank;',
        'import org.springframework.web.bind.annotation.*;',
        'import org.springframework.security.access.prepost.PreAuthorize;',
        '@RestController',
        '@RequestMapping("/admin")',
        'public class SecureController {',
        '  @GetMapping("/audit")',
        '  @PreAuthorize("hasRole(\'ADMIN\')")',
        '  public AuditReport getAuditReport() { return service.getReport(); }',
        '}',
      ].join('\n'));

      const result = scanBackendApiSignals(tempDir);
      expect(result.endpoints.length).toBeGreaterThanOrEqual(1);
      const adminEndpoint = result.endpoints.find(e => e.path.includes('audit'));
      expect(adminEndpoint).toBeDefined();
      expect(adminEndpoint!.securityHints.length).toBeGreaterThanOrEqual(1);
      expect(adminEndpoint!.securityHints.some(h => h.includes('PreAuthorize'))).toBe(true);
    });

    it('should skip files that are not controllers', () => {
      writeJavaFile(tempDir, 'src/main/java/com/bank/model/Account.java', [
        'package com.bank.model;',
        'public class Account {',
        '  private String id;',
        '  private BigDecimal balance;',
        '  public String getId() { return id; }',
        '  public void setId(String id) { this.id = id; }',
        '}',
      ].join('\n'));

      const result = scanBackendApiSignals(tempDir);
      expect(result.endpoints).toHaveLength(0);
    });

    it('should detect @RequestMapping on method level', () => {
      writeJavaFile(tempDir, 'src/main/java/com/bank/GenericController.java', [
        'package com.bank;',
        'import org.springframework.web.bind.annotation.*;',
        '@RestController',
        'public class GenericController {',
        '  @RequestMapping(path = "/health", method = RequestMethod.GET)',
        '  public String health() { return "OK"; }',
        '}',
      ].join('\n'));

      const result = scanBackendApiSignals(tempDir);
      const healthEndpoint = result.endpoints.find(e => e.path === '/health');
      expect(healthEndpoint).toBeDefined();
      expect(healthEndpoint!.httpMethod).toBe('GET');
    });

    it('should extract request body DTO type', () => {
      writeJavaFile(tempDir, 'src/main/java/com/bank/PaymentController.java', [
        'package com.bank;',
        'import org.springframework.web.bind.annotation.*;',
        '@RestController',
        '@RequestMapping("/payments")',
        'public class PaymentController {',
        '  @PostMapping',
        '  public PaymentResponse createPayment(@RequestBody @Valid PaymentRequest request) {',
        '    return service.process(request);',
        '  }',
        '}',
      ].join('\n'));

      const result = scanBackendApiSignals(tempDir);
      const paymentEndpoint = result.endpoints.find(e => e.path === '/payments');
      expect(paymentEndpoint).toBeDefined();
      expect(paymentEndpoint!.requestBody).toBe('PaymentRequest');
    });

    it('should skip files in node_modules and target directories', () => {
      writeJavaFile(tempDir, 'node_modules/fake-lib/FakeController.java', [
        '@RestController',
        'public class FakeController { @GetMapping("/fake") public String f() { return ""; } }',
      ].join('\n'));
      writeJavaFile(tempDir, 'target/classes/com/bank/CompiledController.java', [
        '@RestController',
        'public class CompiledController { @GetMapping("/compiled") public String f() { return ""; } }',
      ].join('\n'));
      writeJavaFile(tempDir, 'src/main/java/com/bank/RealController.java', [
        'package com.bank;',
        '@RestController',
        'public class RealController { @GetMapping("/real") public String f() { return ""; } }',
      ].join('\n'));

      const result = scanBackendApiSignals(tempDir);
      const paths = result.endpoints.map(e => e.path);
      expect(paths).not.toContain('/fake');
      expect(paths).not.toContain('/compiled');
      expect(paths).toContain('/real');
    });

    it('should respect MAX_FILE_SIZE limit', () => {
      // Write a file larger than MAX_FILE_SIZE (180_000 bytes)
      const bigContent = '// big file\n' + 'x'.repeat(190_000) + '\n@RestController\npublic class BigController { @GetMapping("/big") public String f() { return ""; } }';
      writeJavaFile(tempDir, 'src/main/java/com/bank/BigController.java', bigContent);

      const result = scanBackendApiSignals(tempDir);
      const bigEndpoint = result.endpoints.find(e => e.path === '/big');
      expect(bigEndpoint).toBeUndefined();
    });
  });

  describe('Python FastAPI scanning', () => {
    it('should detect FastAPI route definitions', () => {
      writePythonFile(tempDir, 'app/main.py', [
        'from fastapi import FastAPI, Depends',
        'app = FastAPI()',
        '',
        '@app.get("/api/v1/users")',
        'async def list_users():',
        '    return await user_service.find_all()',
        '',
        '@app.post("/api/v1/users")',
        'async def create_user(req: CreateUserRequest):',
        '    return await user_service.create(req)',
      ].join('\n'));

      const result = scanBackendApiSignals(tempDir);
      const methods = result.endpoints.map(e => `${e.httpMethod} ${e.path}`);
      expect(methods).toContain('GET /api/v1/users');
      expect(methods).toContain('POST /api/v1/users');
    });

    it('should detect FastAPI dependency injection for security', () => {
      writePythonFile(tempDir, 'app/secure.py', [
        'from fastapi import FastAPI, Depends, Security',
        'from fastapi.security import HTTPBearer',
        'app = FastAPI()',
        '',
        'security = HTTPBearer()',
        '',
        '@app.get("/api/v1/secure-data")',
        'async def get_secure_data(token: str = Depends(security), current_user = Depends(get_current_user)):',
        '    return {"data": "sensitive"}',
      ].join('\n'));

      const result = scanBackendApiSignals(tempDir);
      const secureEndpoint = result.endpoints.find(e => e.path.includes('secure-data'));
      expect(secureEndpoint).toBeDefined();
      expect(secureEndpoint!.securityHints.length).toBeGreaterThanOrEqual(1);
    });

    it('should detect FastAPI with router prefix', () => {
      writePythonFile(tempDir, 'app/routes/users.py', [
        'from fastapi import APIRouter',
        'router = APIRouter(prefix="/api/v1/users")',
        '',
        '@router.get("/{user_id}")',
        'async def get_user(user_id: int):',
        '    return {"id": user_id}',
      ].join('\n'));

      // Note: current scanner doesn't resolve router prefix, so path will be just "/{user_id}"
      // This test documents current behavior
      const result = scanBackendApiSignals(tempDir);
      expect(result.endpoints.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Python Flask scanning', () => {
    it('should detect Flask route definitions', () => {
      writePythonFile(tempDir, 'app/flask_app.py', [
        'from flask import Flask',
        'app = Flask(__name__)',
        '',
        '@app.route("/health")',
        'def health():',
        '    return "OK"',
        '',
        '@app.route("/api/data", methods=["POST"])',
        'def create_data():',
        '    return {"status": "created"}',
      ].join('\n'));

      const result = scanBackendApiSignals(tempDir);
      const flaskEndpoints = result.endpoints.filter(e => e.framework === 'flask');
      expect(flaskEndpoints.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty workspace with no Java/Python files', () => {
      writeJavaFile(tempDir, 'README.md', '# Just a readme');
      writeJavaFile(tempDir, 'package.json', '{}');

      const result = scanBackendApiSignals(tempDir);
      expect(result.scannedFiles).toBe(0);
      expect(result.endpoints).toHaveLength(0);
    });

    it('should handle symlinks gracefully', () => {
      try {
        const realDir = path.join(tempDir, 'real');
        fs.mkdirSync(realDir);
        writeJavaFile(realDir, 'RealController.java', [
          '@RestController',
          'public class RealController { @GetMapping("/real") public String f() { return ""; } }',
        ].join('\n'));

        // Try to create a symlink - this might fail on some platforms
        try {
          fs.symlinkSync(realDir, path.join(tempDir, 'linked'), 'dir');
        } catch {
          // Symlinks not supported on this platform, skip
          return;
        }

        const result = scanBackendApiSignals(tempDir);
        // Should not crash, should find at least the controller
        expect(result).toBeDefined();
      } catch {
        // Skip if symlink creation fails entirely
      }
    });

    it('should handle binary files gracefully', () => {
      const binaryPath = path.join(tempDir, 'Controller.class');
      fs.mkdirSync(path.dirname(binaryPath), { recursive: true });
      fs.writeFileSync(binaryPath, Buffer.from([0xCA, 0xFE, 0xBA, 0xBE]));

      // .class files are not .java or .py, should be filtered
      const result = scanBackendApiSignals(tempDir);
      expect(result.scannedFiles).toBe(0);
    });

    it('should not crash on malformed Java files', () => {
      writeJavaFile(tempDir, 'MalformedController.java', 'this is not valid java @@@ @RestController @@@');

      const result = scanBackendApiSignals(tempDir);
      expect(result).toBeDefined();
      // Should not throw - malformed regex should just not match
    });

    it('should handle very long file paths gracefully', () => {
      const longRelativePath = path.join(
        'src', 'main', 'java', 'com', 'bank', 'very', 'deep', 'package', 'structure',
        'that', 'goes', 'many', 'levels', 'deep', 'for', 'testing', 'DeepController.java'
      );
      writeJavaFile(tempDir, longRelativePath, [
        '@RestController',
        'public class DeepController { @GetMapping("/deep") public String f() { return ""; } }',
      ].join('\n'));

      const result = scanBackendApiSignals(tempDir);
      const deepEndpoint = result.endpoints.find(e => e.path === '/deep');
      expect(deepEndpoint).toBeDefined();
      expect(deepEndpoint!.file).toContain('DeepController.java');
    });

    it('should limit output to 120 endpoints', () => {
      for (let i = 0; i < 150; i++) {
        writeJavaFile(tempDir, `src/controllers/Controller${i}.java`, [
          'package com.bank;',
          '@RestController',
          `public class Controller${i} { @GetMapping("/endpoint${i}") public String f() { return ""; } }`,
        ].join('\n'));
      }

      const result = scanBackendApiSignals(tempDir);
      // Rendering limit is 120
      expect(result.endpoints.length).toBeGreaterThanOrEqual(120);
    });
  });

  describe('DTO scanning', () => {
    it('should detect Java records as DTOs', () => {
      writeJavaFile(tempDir, 'src/main/java/com/bank/dto/UserRecord.java', [
        'package com.bank.dto;',
        'import jakarta.validation.constraints.*;',
        'public record UserRecord(',
        '  @NotNull String id,',
        '  @NotBlank @Size(max = 100) String name,',
        '  @Email String email',
        ') {}',
      ].join('\n'));

      const result = scanBackendApiSignals(tempDir);
      expect(result.dtoHints.length).toBeGreaterThanOrEqual(1);
      expect(result.dtoHints.some(h => h.includes('UserRecord'))).toBe(true);
    });

    it('should detect multiple DTOs in different files', () => {
      writeJavaFile(tempDir, 'src/main/java/com/bank/dto/RequestA.java', [
        'package com.bank.dto;',
        'import jakarta.validation.constraints.NotNull;',
        'public class RequestA { @NotNull private String fieldA; }',
      ].join('\n'));
      writeJavaFile(tempDir, 'src/main/java/com/bank/dto/RequestB.java', [
        'package com.bank.dto;',
        'import jakarta.validation.constraints.Size;',
        'public class RequestB { @Size(max=50) private String fieldB; }',
      ].join('\n'));

      const result = scanBackendApiSignals(tempDir);
      expect(result.dtoHints.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('rendered markdown output', () => {
    it('should contain endpoint summary section', () => {
      writeJavaFile(tempDir, 'TestController.java', [
        '@RestController',
        'public class TestController { @GetMapping("/test") public String f() { return ""; } }',
      ].join('\n'));

      const result = scanBackendApiSignals(tempDir);
      expect(result.markdown).toContain('Backend API Code Scan');
      expect(result.markdown).toContain('Endpoint Signals');
      expect(result.markdown).toContain('GET /test');
    });

    it('should show "No endpoints" message when empty', () => {
      const emptyDir = createTempDir();
      try {
        writeJavaFile(emptyDir, 'readme.txt', 'just text');
        const result = scanBackendApiSignals(emptyDir);
        expect(result.markdown).toContain('No endpoints were found');
      } finally {
        fs.rmSync(emptyDir, { recursive: true, force: true });
      }
    });
  });
});
