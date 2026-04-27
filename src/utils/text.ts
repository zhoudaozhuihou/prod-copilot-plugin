/**
 * Product Dev Copilot Source Note
 *
 * File: src/utils/text.ts
 * Purpose: Text utility helpers for truncation and formatting.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */


export function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length <= maxLength ? text : `${text.slice(0, maxLength)}\n...<truncated ${text.length - maxLength} chars>`;
}

export function detectLanguage(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith('.tsx')) return 'tsx';
  if (lower.endsWith('.ts')) return 'typescript';
  if (lower.endsWith('.jsx')) return 'jsx';
  if (lower.endsWith('.js')) return 'javascript';
  if (lower.endsWith('.vue')) return 'vue';
  if (lower.endsWith('.py')) return 'python';
  if (lower.endsWith('.java')) return 'java';
  if (lower.endsWith('.kt')) return 'kotlin';
  if (lower.endsWith('.sql')) return 'sql';
  if (lower.endsWith('.yaml') || lower.endsWith('.yml')) return 'yaml';
  if (lower.endsWith('.json')) return 'json';
  if (lower.endsWith('.md')) return 'markdown';
  if (lower.endsWith('.xml')) return 'xml';
  return 'text';
}

export function extractRouteHints(content: string): string[] {
  const patterns = [
    /path\s*=\s*["'`]([^"'`]+)["'`]/g,
    /Route\s*\(\s*["'`]([^"'`]+)["'`]/g,
    /router\.(get|post|put|delete|patch)\s*\(\s*["'`]([^"'`]+)["'`]/g,
    /@(Get|Post|Put|Delete|Patch)Mapping\s*\(\s*["'`]([^"'`]+)["'`]/g,
    /@RequestMapping\s*\(\s*["'`]([^"'`]+)["'`]/g,
    /@app\.(get|post|put|delete|patch)\s*\(\s*["'`]([^"'`]+)["'`]/g,
  ];
  return collectMatches(content, patterns);
}

export function extractApiHints(content: string): string[] {
  const patterns = [
    /fetch\s*\(\s*["'`]([^"'`]+)["'`]/g,
    /axios\.(get|post|put|delete|patch)\s*\(\s*["'`]([^"'`]+)["'`]/g,
    /http\.(get|post|put|delete|patch)\s*\(\s*["'`]([^"'`]+)["'`]/g,
    /@FeignClient\s*\([^\)]*\)/g,
    /RestTemplate|WebClient|requests\.|httpx\.|aiohttp\./g,
    /openapi|swagger|AsyncAPI/gi,
  ];
  return collectMatches(content, patterns);
}

export function extractDatabaseHints(content: string): string[] {
  const patterns = [
    /postgres(?:ql)?|jdbc:postgresql|psycopg|asyncpg/gi,
    /maxcompute|odps|pyodps/gi,
    /bigquery|google\.cloud\.bigquery/gi,
    /oracle|jdbc:oracle|cx_Oracle|oracledb/gi,
    /mysql|jdbc:mysql|pymysql|mysqlclient/gi,
    /snowflake|databricks|hive|spark\.sql/gi,
    /CREATE\s+TABLE\s+([\w\."`]+)|ALTER\s+TABLE\s+([\w\."`]+)|CREATE\s+INDEX\s+([\w\."`]+)/gi,
  ];
  return collectMatches(content, patterns);
}

export function extractFrontendHints(content: string): string[] {
  const patterns = [
    /useState|useEffect|useMemo|useCallback|createContext/g,
    /redux|zustand|mobx|react-query|tanstack/gi,
    /Formik|React Hook Form|yup|zod/gi,
    /DataGrid|Table|Modal|Dialog|Drawer|Form|Select|DatePicker/g,
    /aria-|role=|tabIndex|accessibility/gi,
    /playwright|cypress|vitest|jest|testing-library/gi,
  ];
  return collectMatches(content, patterns);
}

export function extractBackendHints(content: string): string[] {
  const patterns = [
    /@RestController|@Controller|@Service|@Repository|@Entity|@Transactional/g,
    /SpringApplication|SecurityFilterChain|OAuth2|JWT|JpaRepository/g,
    /FastAPI|APIRouter|BaseModel|pydantic|SQLAlchemy|alembic|pytest/gi,
    /Flask|Django|Celery|gunicorn|uvicorn/gi,
    /Redis|Kafka|RabbitMQ|SQS|PubSub|OpenTelemetry/gi,
  ];
  return collectMatches(content, patterns);
}

export function extractDataPipelineHints(content: string): string[] {
  const patterns = [
    /airflow|dagster|prefect|dbt|kedro|spark|flink|beam/gi,
    /partition|cluster by|materialized view|merge into|insert overwrite/gi,
    /data quality|great_expectations|deequ|SLA|lineage|catalog/gi,
    /schedule|backfill|retry|idempotent|watermark/gi,
  ];
  return collectMatches(content, patterns);
}

function collectMatches(content: string, patterns: RegExp[]): string[] {
  const results = new Set<string>();
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      const value = match.slice(1).find(Boolean) ?? match[0];
      if (value && value.length <= 160) results.add(value.trim());
      if (results.size >= 100) break;
    }
  }
  return [...results];
}
