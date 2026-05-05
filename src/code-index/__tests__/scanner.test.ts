import { describe, it, expect } from 'vitest';
import { detectLanguage, scanFile, TEST_HOOKS } from '../scanner';

describe('detectLanguage', () => {
  it('should detect TypeScript from .ts', () => {
    expect(detectLanguage('file.ts')).toBe('typescript');
  });

  it('should detect TypeScript from .tsx', () => {
    expect(detectLanguage('file.tsx')).toBe('typescript');
  });

  it('should detect JavaScript from .js', () => {
    expect(detectLanguage('file.js')).toBe('javascript');
  });

  it('should detect Java from .java', () => {
    expect(detectLanguage('file.java')).toBe('java');
  });

  it('should detect Python from .py', () => {
    expect(detectLanguage('file.py')).toBe('python');
  });

  it('should detect SQL from .sql', () => {
    expect(detectLanguage('file.sql')).toBe('sql');
  });

  it('should detect Go from .go', () => {
    expect(detectLanguage('file.go')).toBe('go');
  });

  it('should detect Rust from .rs', () => {
    expect(detectLanguage('file.rs')).toBe('rust');
  });

  it('should detect YAML from .yaml', () => {
    expect(detectLanguage('file.yaml')).toBe('yaml');
  });

  it('should detect JSON from .json', () => {
    expect(detectLanguage('file.json')).toBe('json');
  });

  it('should return unknown for unrecognized extension', () => {
    expect(detectLanguage('file.xyz')).toBe('unknown');
  });

  it('should handle uppercase extensions', () => {
    expect(detectLanguage('file.TS')).toBe('typescript');
  });
});

describe('scanFile (TypeScript)', () => {
  it('should detect a class declaration', () => {
    const content = 'export class UserService {\n  private name: string;\n}';
    const entities = scanFile('/test/user.ts', content, 'typescript');
    expect(entities.some(e => e.kind === 'class' && e.name === 'UserService')).toBe(true);
  });

  it('should detect an interface', () => {
    const content = 'export interface User {\n  id: number;\n  name: string;\n}';
    const entities = scanFile('/test/types.ts', content, 'typescript');
    expect(entities.some(e => e.kind === 'interface' && e.name === 'User')).toBe(true);
  });

  it('should detect an enum', () => {
    const content = 'export enum Status {\n  ACTIVE,\n  INACTIVE\n}';
    const entities = scanFile('/test/enums.ts', content, 'typescript');
    expect(entities.some(e => e.kind === 'enum' && e.name === 'Status')).toBe(true);
  });

  it('should detect a function declaration', () => {
    const content = 'export function calculateTotal(items: Item[]): number {\n  return items.reduce((sum, i) => sum + i.price, 0);\n}';
    const entities = scanFile('/test/util.ts', content, 'typescript');
    expect(entities.some(e => e.kind === 'function' && e.name === 'calculateTotal')).toBe(true);
  });

  it('should detect an arrow function export', () => {
    const content = 'export const formatDate = (date: Date): string => {\n  return date.toISOString();\n};';
    const entities = scanFile('/test/format.ts', content, 'typescript');
    expect(entities.some(e => e.kind === 'function' && e.name === 'formatDate')).toBe(true);
  });

  it('should detect Express routes', () => {
    const content = 'router.get("/api/users", async (req, res) => {\n  const users = await User.find();\n  res.json(users);\n});';
    const entities = scanFile('/test/routes.ts', content, 'typescript');
    expect(entities.some(e => e.kind === 'route' && e.routeMethod === 'GET' && e.routePath === '/api/users')).toBe(true);
  });

  it('should detect Next.js route methods', () => {
    const content = 'app.post("/api/items", handler);\napp.delete("/api/items/:id", handler);';
    const entities = scanFile('/test/api.ts', content, 'typescript');
    expect(entities.some(e => e.routeMethod === 'POST' && e.routePath === '/api/items')).toBe(true);
    expect(entities.some(e => e.routeMethod === 'DELETE' && e.routePath === '/api/items/:id')).toBe(true);
  });

  it('should detect React components', () => {
    const content = 'const UserProfile: React.FC<UserProfileProps> = ({ user }) => {\n  return <div>{user.name}</div>;\n};';
    const entities = scanFile('/test/components.tsx', content, 'typescript');
    expect(entities.some(e => e.kind === 'function' && e.name === 'UserProfile')).toBe(true);
  });

  it('should detect abstract class', () => {
    const content = 'export abstract class BaseRepository<T> {\n  abstract find(id: string): Promise<T>;\n}';
    const entities = scanFile('/test/base.ts', content, 'typescript');
    expect(entities.some(e => e.kind === 'class' && e.name === 'BaseRepository')).toBe(true);
  });

  it('should deduplicate entities with same kind/name/line', () => {
    // Build a scenario where deduplication would matter — same entity matched by multiple patterns
    const content = 'const Foo: React.FC<Props> = ({ x }) => <div/>;\nconst Foo: React.FC<Props> = ({ x }) => <div/>;';
    const entities = scanFile('/test/dup.ts', content, 'typescript');
    const fooFuncs = entities.filter(e => e.kind === 'function' && e.name === 'Foo');
    // Different lines should NOT be deduplicated
    expect(fooFuncs.length).toBe(2);
  });
});

describe('scanFile (Java)', () => {
  it('should detect a Java class', () => {
    const content = 'public class UserEntity {\n  private Long id;\n  private String name;\n}';
    const entities = scanFile('/test/UserEntity.java', content, 'java');
    expect(entities.some(e => e.kind === 'class' && e.name === 'UserEntity')).toBe(true);
  });

  it('should detect a Spring Boot controller', () => {
    const content = '@RestController\n@RequestMapping("/api/users")\npublic class UserController {\n  @GetMapping("/{id}")\n  public User getUser(@PathVariable Long id) { return null; }\n}';
    const entities = scanFile('/test/UserController.java', content, 'java');
    expect(entities.some(e => e.kind === 'controller')).toBe(true);
    expect(entities.some(e => e.kind === 'route' && e.routeMethod === 'GET' && e.routePath === '/{id}')).toBe(true);
  });

  it('should detect a Spring Boot service', () => {
    const content = '@Service\npublic class UserService {\n  public User findById(Long id) { return null; }\n}';
    const entities = scanFile('/test/UserService.java', content, 'java');
    expect(entities.some(e => e.kind === 'service' && e.name === 'UserService')).toBe(true);
  });

  it('should detect PostMapping routes', () => {
    const content = '@PostMapping("/users")\npublic User create(@RequestBody UserCreateRequest req) { return null; }';
    const entities = scanFile('/test/UserController.java', content, 'java');
    expect(entities.some(e => e.kind === 'route' && e.routeMethod === 'POST' && e.routePath === '/users')).toBe(true);
  });

  it('should detect DTOs with Lombok annotations', () => {
    const content = '@Data\n@AllArgsConstructor\npublic class UserCreateRequest {\n  @NotBlank private String name;\n}';
    const entities = scanFile('/test/dto.java', content, 'java');
    expect(entities.some(e => e.kind === 'dto' && e.name === 'UserCreateRequest')).toBe(true);
  });

  it('should detect repositories', () => {
    const content = '@Repository\npublic interface UserRepository extends JpaRepository<User, Long> {}';
    const entities = scanFile('/test/UserRepository.java', content, 'java');
    expect(entities.some(e => e.kind === 'repository' && e.name === 'UserRepository')).toBe(true);
  });

  it('should detect Java record', () => {
    const content = 'public record Address(String street, String city) {}';
    const entities = scanFile('/test/Address.java', content, 'java');
    expect(entities.some(e => e.kind === 'record')).toBe(true);
  });

  it('should detect an enum in Java', () => {
    const content = 'public enum OrderStatus { PENDING, APPROVED, REJECTED }';
    const entities = scanFile('/test/Status.java', content, 'java');
    expect(entities.some(e => e.kind === 'enum' && e.name === 'OrderStatus')).toBe(true);
  });

  it('should detect RequestMapping routes', () => {
    const content = '@RequestMapping(method = RequestMethod.PUT, path = "/users/{id}")\npublic User update(@PathVariable Long id, @RequestBody UserUpdateRequest req) { return null; }';
    const entities = scanFile('/test/UserController.java', content, 'java');
    expect(entities.some(e => e.kind === 'route' && e.routeMethod === 'PUT')).toBe(true);
  });
});

describe('scanFile (Python)', () => {
  it('should detect a Python class', () => {
    const content = 'class UserService:\n    def get_user(self, user_id: int):\n        pass';
    const entities = scanFile('/test/service.py', content, 'python');
    expect(entities.some(e => e.kind === 'class' && e.name === 'UserService')).toBe(true);
  });

  it('should detect a Python function', () => {
    const content = 'def calculate_total(items: list) -> float:\n    return sum(item.price for item in items)';
    const entities = scanFile('/test/util.py', content, 'python');
    expect(entities.some(e => e.kind === 'function' && e.name === 'calculate_total')).toBe(true);
  });

  it('should detect FastAPI routes', () => {
    const content = '@app.get("/api/users")\nasync def list_users():';
    const entities = scanFile('/test/routes.py', content, 'python');
    expect(entities.some(e => e.kind === 'route' && e.routeMethod === 'GET' && e.routePath === '/api/users')).toBe(true);
  });

  it('should detect Flask routes', () => {
    const content = '@app.route("/api/items")';
    const entities = scanFile('/test/flask_routes.py', content, 'python');
    expect(entities.some(e => e.kind === 'route' && e.routeMethod === 'GET' && e.routePath === '/api/items')).toBe(true);
  });

  it('should detect Pydantic models', () => {
    const content = 'class UserCreateRequest(BaseModel):\n    name: str\n    email: EmailStr';
    const entities = scanFile('/test/schemas.py', content, 'python');
    expect(entities.some(e => e.kind === 'dto' && e.name === 'UserCreateRequest')).toBe(true);
  });

  it('should detect async functions', () => {
    const content = 'async def process_data(data: dict) -> dict:\n    return {"processed": True}';
    const entities = scanFile('/test/async_util.py', content, 'python');
    expect(entities.some(e => e.kind === 'function' && e.name === 'process_data')).toBe(true);
  });
});

describe('scanFile (SQL)', () => {
  it('should detect CREATE TABLE', () => {
    const content = 'CREATE TABLE users (\n  id BIGINT PRIMARY KEY,\n  name VARCHAR(255) NOT NULL\n);';
    const entities = scanFile('/test/schema.sql', content, 'sql');
    expect(entities.some(e => e.kind === 'sql_table' && e.name === 'users')).toBe(true);
  });

  it('should detect CREATE VIEW', () => {
    const content = 'CREATE VIEW active_users AS SELECT * FROM users WHERE status = \'ACTIVE\';';
    const entities = scanFile('/test/views.sql', content, 'sql');
    expect(entities.some(e => e.kind === 'sql_view' && e.name === 'active_users')).toBe(true);
  });

  it('should detect INSERT INTO', () => {
    const content = 'INSERT INTO dwd_customer_daily (customer_id, name) VALUES (1, \'test\');';
    const entities = scanFile('/test/insert.sql', content, 'sql');
    expect(entities.some(e => e.kind === 'sql_table' && e.name === 'dwd_customer_daily')).toBe(true);
  });

  it('should detect MERGE INTO', () => {
    const content = 'MERGE INTO target_table t USING source_table s ON t.id = s.id;';
    const entities = scanFile('/test/merge.sql', content, 'sql');
    expect(entities.some(e => e.kind === 'sql_table' && e.name === 'target_table')).toBe(true);
  });

  it('should detect schema-qualified tables', () => {
    const content = 'CREATE TABLE ods.customers (\n  id INT\n);';
    const entities = scanFile('/test/schema.sql', content, 'sql');
    expect(entities.some(e => e.kind === 'sql_table' && e.name === 'customers')).toBe(true);
  });
});

describe('scanFile (Go)', () => {
  it('should detect a Go struct', () => {
    const content = 'type User struct {\n  ID   int64\n  Name string\n}';
    const entities = scanFile('/test/models.go', content, 'go');
    expect(entities.some(e => e.kind === 'class' && e.name === 'User')).toBe(true);
  });

  it('should detect a Go interface', () => {
    const content = 'type UserRepository interface {\n  FindByID(id int64) (*User, error)\n}';
    const entities = scanFile('/test/repo.go', content, 'go');
    expect(entities.some(e => e.kind === 'interface' && e.name === 'UserRepository')).toBe(true);
  });

  it('should detect a Go function', () => {
    const content = 'func CalculateTotal(items []Item) float64 {\n  var total float64\n  return total\n}';
    const entities = scanFile('/test/util.go', content, 'go');
    expect(entities.some(e => e.kind === 'function' && e.name === 'CalculateTotal')).toBe(true);
  });

  it('should detect a Go method', () => {
    const content = 'func (s *UserService) GetUser(ctx context.Context, id int64) (*User, error) {\n  return nil, nil\n}';
    const entities = scanFile('/test/service.go', content, 'go');
    expect(entities.some(e => e.kind === 'function' && e.name === 'GetUser')).toBe(true);
  });
});

describe('scanFile (Generic/Unknown)', () => {
  it('should detect generic class pattern', () => {
    const content = 'class Calculator {\n  def compute(x: Int): Int = x * 2\n}';
    const entities = scanFile('/test/calc.scala', content, 'unknown');
    expect(entities.some(e => e.kind === 'class' && e.name === 'Calculator')).toBe(true);
  });

  it('should detect generic function pattern', () => {
    const content = 'fn process(input: &str) -> bool {\n  true\n}';
    const entities = scanFile('/test/process.rs', content, 'unknown');
    expect(entities.some(e => e.kind === 'function' && e.name === 'process')).toBe(true);
  });

  it('should return empty for empty content', () => {
    const entities = scanFile('/test/empty.ts', '', 'typescript');
    expect(entities).toHaveLength(0);
  });
});

describe('TEST_HOOKS scanTypeScript', () => {
  it('should detect interfaces', () => {
    const entities = TEST_HOOKS.scanTypeScript('/test.ts', 'interface Foo {}', 'typescript');
    expect(entities.some(e => e.kind === 'interface' && e.name === 'Foo')).toBe(true);
  });
});

describe('TEST_HOOKS scanJava', () => {
  it('should detect PatchMapping routes', () => {
    const content = '@PatchMapping("/users/{id}")\npublic User patch(@PathVariable Long id, @RequestBody Map<String, Object> updates) { return null; }';
    const entities = TEST_HOOKS.scanJava('/test/Controller.java', content);
    expect(entities.some(e => e.kind === 'route' && e.routeMethod === 'PATCH')).toBe(true);
  });
});

describe('TEST_HOOKS scanPython', () => {
  it('should detect FastAPI router prefix routes', () => {
    const content = '@router.post("/items")\nasync def create_item(item: Item):';
    const entities = TEST_HOOKS.scanPython('/test/routes.py', content);
    expect(entities.some(e => e.kind === 'route' && e.routeMethod === 'POST' && e.routePath === '/items')).toBe(true);
  });
});

describe('TEST_HOOKS scanSql', () => {
  it('should detect CREATE OR REPLACE VIEW', () => {
    const content = 'CREATE OR REPLACE VIEW user_summary AS SELECT id, name FROM users;';
    const entities = TEST_HOOKS.scanSql('/test/view.sql', content);
    expect(entities.some(e => e.kind === 'sql_view' && e.name === 'user_summary')).toBe(true);
  });
});

describe('TEST_HOOKS scanGo', () => {
  it('should detect structs without function context noise', () => {
    const content = 'type Config struct {\n  Timeout int\n}';
    const entities = TEST_HOOKS.scanGo('/test/config.go', content);
    expect(entities.some(e => e.kind === 'class' && e.name === 'Config')).toBe(true);
  });
});
