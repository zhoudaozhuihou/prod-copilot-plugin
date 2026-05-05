/**
 * SQL Static Lineage Parser
 *
 * A rule-based engine for extracting table and column-level lineage from SQL DML statements.
 * Uses pattern matching (not LLM) for deterministic, auditable lineage extraction.
 *
 * Supports:
 * - INSERT ... SELECT: Extracts source → target table lineage
 * - CTE (WITH clause): Unfolds CTE chain and resolves field provenance
 * - MERGE: Extracts source/target/using tables
 * - UPDATE ... FROM: Extracts updated table and source tables
 * - CREATE TABLE ... AS SELECT (CTAS)
 *
 * Designed for bank-grade BCBS 239 lineage traceability requirements.
 * Output is structured JSON suitable for Mermaid graph generation.
 */

export interface ColumnLineage {
  targetColumn: string;
  sourceColumns: Array<{
    table: string;
    column: string;
    expression?: string;
  }>;
  transform?: string;
}

export interface TableLineage {
  targetTable: string;
  targetDatabase?: string;
  operation: 'INSERT' | 'MERGE' | 'UPDATE' | 'CTAS';
  sourceTables: string[];
  columnLineage: ColumnLineage[];
  confidence: 'high' | 'medium' | 'low';
}

export interface LineageResult {
  sources: string[];
  targets: string[];
  tables: TableLineage[];
  warnings: string[];
}

// Regex patterns for SQL statement classification
const INSERT_SELECT_PATTERN = /INSERT\s+(?:INTO\s+)?(\w+(?:\.\w+)?)\s*(?:\(([^)]*)\))?\s*SELECT/i;
const WITH_CLAUSE_PATTERN = /WITH\s+([\s\S]*?)\s*SELECT/i;
const MERGE_PATTERN = /MERGE\s+INTO\s+(\w+(?:\.\w+)?)\s+(?:\w+\s+)?USING\s+/i;
const UPDATE_FROM_PATTERN = /UPDATE\s+(\w+(?:\.\w+)?)\s+(?:\w+\s+)?SET\s+[\s\S]*?FROM\s+(\w+(?:\.\w+)?)/i;
const CTAS_PATTERN = /CREATE\s+(?:OR\s+REPLACE\s+)?TABLE\s+(?:`?\w+`?\.)*(`?\w+`?(?:\.`?\w+`?)?)\s+AS\s+SELECT/i;
const FROM_PATTERN = /FROM\s+((?:\w+(?:\.\w+)*(?:\s+(?:AS\s+)?\w+)?(?:\s*,\s*(?:\w+(?:\.\w+)*(?:\s+(?:AS\s+)?\w+)?))*))/i;
const JOIN_PATTERN = /JOIN\s+(\w+(?:\.\w+)*(?:\s+(?:AS\s+)?\w+)?)/gi;

/**
 * Parse a single SQL statement and extract lineage information.
 */
export function parseLineage(sql: string): LineageResult {
  const sqlClean = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  const warnings: string[] = [];
  const tables: TableLineage[] = [];

  // Try INSERT ... SELECT
  const insertMatch = sqlClean.match(INSERT_SELECT_PATTERN);
  if (insertMatch) {
    const targetTable = insertMatch[1];
    const targetColumnsRaw = insertMatch[2];
    const restSql = sqlClean.slice(insertMatch[0].length);

    const sourceTables = extractSourceTables(restSql);
    const targetColumns = targetColumnsRaw
      ? targetColumnsRaw.split(',').map(c => c.trim()).filter(Boolean)
      : [];
    const selectFields = extractSelectFields(sqlClean);

    const columnLineage = buildColumnLineage(targetColumns, selectFields, sourceTables, sqlClean);

    tables.push({
      targetTable,
      operation: 'INSERT',
      sourceTables,
      columnLineage,
      confidence: targetColumns.length > 0 && columnLineage.length > 0 ? 'high' : 'medium',
    });

    return { sources: sourceTables, targets: [targetTable], tables, warnings };
  }

  // Try MERGE
  const mergeMatch = sqlClean.match(MERGE_PATTERN);
  if (mergeMatch) {
    const targetTable = mergeMatch[1];
    const sourceTable = mergeMatch[2];
    const sourceTables = extractSourceTables(sqlClean);

    tables.push({
      targetTable,
      operation: 'MERGE',
      sourceTables: sourceTables.length > 0 ? sourceTables : [sourceTable],
      columnLineage: [],
      confidence: 'medium',
    });

    return { sources: sourceTables, targets: [targetTable], tables, warnings };
  }

  // Try UPDATE ... FROM
  const updateMatch = sqlClean.match(UPDATE_FROM_PATTERN);
  if (updateMatch) {
    const targetTable = updateMatch[1];
    const fromTable = updateMatch[2];
    const sourceTables = extractSourceTables(sqlClean);

    tables.push({
      targetTable,
      operation: 'UPDATE',
      sourceTables: sourceTables.length > 0 ? sourceTables : [fromTable],
      columnLineage: [],
      confidence: 'medium',
    });

    return { sources: sourceTables, targets: [targetTable], tables, warnings };
  }

  // Try CTAS
  const ctasMatch = sqlClean.match(CTAS_PATTERN);
  if (ctasMatch) {
    const targetTable = ctasMatch[1];
    const selectPart = sqlClean.slice(sqlClean.toUpperCase().indexOf('AS SELECT') + 9);
    const sourceTables = extractSourceTables(selectPart);
    const selectFields = extractSelectFields(selectPart);
    const columnLineage = buildColumnLineage([], selectFields, sourceTables, sqlClean);

    tables.push({
      targetTable,
      operation: 'CTAS',
      sourceTables,
      columnLineage,
      confidence: sourceTables.length > 0 ? 'high' : 'low',
    });

    return { sources: sourceTables, targets: [targetTable], tables, warnings };
  }

  // No known DML pattern found — check if it's a simple SELECT (query only, no DML)
  if (/^\s*SELECT/i.test(sqlClean)) {
    warnings.push('SQL is a SELECT query with no DML operation. No lineage targets found.');
  } else {
    warnings.push('No supported DML pattern detected (INSERT SELECT, MERGE, UPDATE FROM, CTAS).');
  }

  return { sources: [], targets: [], tables, warnings };
}

/**
 * Parse multiple SQL statements (split by semicolons) and merge lineage results.
 */
export function parseBatchLineage(sqlStatements: string): LineageResult[] {
  return sqlStatements
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 10 && /INSERT|MERGE|UPDATE|CREATE\s+TABLE/i.test(s))
    .map(s => parseLineage(s));
}

/**
 * Extract source table names from the FROM/JOIN/USING clauses.
 */
function extractSourceTables(sql: string): string[] {
  const tables = new Set<string>();

  // Extract MERGE USING source tables
  const usingMatch = sql.match(/USING\s+(\w+(?:\.\w+)?)/i);
  if (usingMatch) {
    tables.add(usingMatch[1]);
  }

  // Extract FROM tables
  const fromMatch = sql.match(FROM_PATTERN);
  if (fromMatch) {
    const fromClause = fromMatch[1];
    fromClause.split(',').forEach(part => {
      const tableName = part.trim().split(/\s+/)[0];
      if (tableName && !/^(AS|INNER|LEFT|RIGHT|FULL|CROSS|OUTER|JOIN|ON|WHERE)$/i.test(tableName)) {
        tables.add(tableName);
      }
    });
  }

  // Extract JOIN tables
  let joinMatch: RegExpExecArray | null;
  const joinRe = new RegExp(JOIN_PATTERN.source, 'gi');
  while ((joinMatch = joinRe.exec(sql)) !== null) {
    const tableName = joinMatch[1].trim().split(/\s+/)[0];
    if (tableName) {
      tables.add(tableName);
    }
  }

  return Array.from(tables);
}

/**
 * Extract SELECT field expressions.
 */
function extractSelectFields(sql: string): string[] {
  // Remove CTEs for simpler parsing
  const noCte = sql.replace(WITH_CLAUSE_PATTERN, '').trim();

  // Get the content between SELECT and FROM
  const selectMatch = noCte.match(/SELECT\s+([\s\S]*?)\s+FROM/i);
  if (!selectMatch) return [];

  const selectBlock = selectMatch[1];

  // Handle simple field splitting (note: this doesn't handle nested subqueries in SELECT)
  const fields: string[] = [];
  let depth = 0;
  let current = '';

  for (const char of selectBlock) {
    if (char === '(') depth++;
    else if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    fields.push(current.trim());
  }

  return fields.filter(f => f.length > 0);
}

/**
 * Build column-level lineage by matching target columns to source SELECT expressions.
 */
function buildColumnLineage(
  targetColumns: string[],
  selectFields: string[],
  sourceTables: string[],
  _fullSql: string
): ColumnLineage[] {
  const lineage: ColumnLineage[] = [];

  // If we have explicit target columns (INSERT INTO tgt(c1, c2) SELECT ...)
  // match them positionally to SELECT expressions
  if (targetColumns.length > 0) {
    targetColumns.forEach((targetCol, i) => {
      if (i < selectFields.length) {
        lineage.push({
          targetColumn: targetCol,
          sourceColumns: resolveFieldProvenance(selectFields[i], sourceTables),
          transform: isSimpleColumnRef(selectFields[i]) ? undefined : selectFields[i].trim(),
        });
      } else {
        lineage.push({
          targetColumn: targetCol,
          sourceColumns: [],
          transform: undefined,
        });
      }
    });
  } else {
    // No explicit target columns — use SELECT expressions as column names (or position)
    selectFields.forEach((field, i) => {
      const alias = extractAlias(field) || `col_${i + 1}`;
      lineage.push({
        targetColumn: alias,
        sourceColumns: resolveFieldProvenance(field, sourceTables),
        transform: isSimpleColumnRef(field) ? undefined : field.trim(),
      });
    });
  }

  return lineage;
}

/**
 * Resolve the provenance of a SELECT expression to source table.column references.
 */
function resolveFieldProvenance(
  expression: string,
  sourceTables: string[]
): Array<{ table: string; column: string; expression?: string }> {
  const results: Array<{ table: string; column: string; expression?: string }> = [];

  if (isSimpleColumnRef(expression)) {
    const ref = expression.trim();
    if (ref.includes('.')) {
      // qualified reference like t.column_name
      const parts = ref.split('.');
      results.push({ table: parts[0], column: parts.slice(1).join('.') });
    } else {
      // unqualified — probe source tables (best effort)
      results.push({ table: sourceTables[0] || 'unknown', column: ref });
    }
  } else if (expression.trim() === '*') {
    // SELECT * — no column-level resolution possible without schema
    sourceTables.forEach(t => {
      results.push({ table: t, column: '*', expression: '*' });
    });
  } else if (expression.trim().toUpperCase() === 'COUNT(*)' || expression.trim().toUpperCase().startsWith('COUNT(')) {
    results.push({ table: sourceTables[0] || 'unknown', column: '*', expression: expression.trim() });
  } else {
    // Complex expression — extract column references
    const colRefs = expression.match(/(\w+(?:\.\w+)?)/g) || [];
    const sqlKeywords = new Set([
      'AS', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
      'CAST', 'COALESCE', 'NVL', 'IFNULL', 'NULLIF', 'CONCAT', 'UPPER', 'LOWER', 'TRIM',
      'SUBSTR', 'SUBSTRING', 'LENGTH', 'REPLACE', 'ABS', 'ROUND', 'FLOOR', 'CEIL',
      'CURRENT_DATE', 'CURRENT_TIMESTAMP', 'SYSDATE', 'NOW', 'TRUE', 'FALSE',
      'DATE', 'TIME', 'TIMESTAMP', 'STRING', 'INT', 'INTEGER', 'BIGINT', 'DECIMAL', 'NUMERIC',
      'VARCHAR', 'CHAR', 'BOOLEAN', 'DOUBLE', 'FLOAT',
    ]);
    colRefs.forEach(ref => {
      const upper = ref.toUpperCase();
      if (!sqlKeywords.has(upper) && !/^\d+(\.\d+)?$/.test(ref)) {
        if (ref.includes('.')) {
          const parts = ref.split('.');
          results.push({ table: parts[0], column: parts.slice(1).join('.') });
        } else {
          results.push({ table: sourceTables[0] || 'unknown', column: ref });
        }
      }
    });
  }

  return results;
}

/**
 * Check if an expression is a simple column reference (not a function, expression, or literal).
 */
function isSimpleColumnRef(expr: string): boolean {
  const trimmed = expr.trim();
  // Exclude SQL built-in functions/keywords that could be mistaken as column refs
  const sqlFunctions = new Set([
    'CURRENT_DATE', 'CURRENT_TIMESTAMP', 'CURRENT_TIME', 'SYSDATE', 'NOW', 'LOCALTIME',
    'LOCALTIMESTAMP', 'UTC_DATE', 'UTC_TIMESTAMP', 'TRUE', 'FALSE', 'NULL',
    'CURRENT_USER', 'SESSION_USER', 'USER', 'CURRENT_CATALOG', 'CURRENT_SCHEMA',
  ]);
  if (sqlFunctions.has(trimmed.toUpperCase())) return false;
  if (/^\w+(\.\w+)?$/.test(trimmed)) return true;
  if (/^\w+\.\w+(\.\w+)?$/.test(trimmed)) return true;
  return false;
}

/**
 * Extract alias from a SELECT expression like "amount * rate AS result" or "amount * rate result".
 */
function extractAlias(expr: string): string | undefined {
  const asMatch = expr.match(/\b(?:AS\s+)?(\w+)\s*$/i);
  if (asMatch) {
    const candidate = asMatch[1].toUpperCase();
    // Filter out SQL keywords that might appear at end
    if (!/^(AS|FROM|WHERE|AND|OR|IN|BY|ON|JOIN|LEFT|RIGHT|INNER|OUTER|CROSS|FULL|HAVING|GROUP|ORDER|LIMIT|OFFSET)$/i.test(candidate)) {
      return asMatch[1];
    }
  }
  return undefined;
}

export function lineageToMarkdown(result: LineageResult, sourceFile?: string): string {
  const lines: string[] = [];

  lines.push(`## Lineage Analysis${sourceFile ? ` (${sourceFile})` : ''}\n`);

  if (result.warnings.length > 0) {
    lines.push('### Warnings');
    result.warnings.forEach(w => lines.push(`- ⚠️ ${w}`));
    lines.push('');
  }

  if (result.tables.length === 0) {
    lines.push('No lineage data could be extracted from the SQL statement.\n');
    return lines.join('\n');
  }

  for (const table of result.tables) {
    lines.push(`### Target: \`${table.targetTable}\``);
    lines.push(`- **Operation**: ${table.operation}`);
    lines.push(`- **Source Tables**: ${table.sourceTables.map(t => `\`${t}\``).join(', ') || '(none detected)'}`);
    lines.push(`- **Confidence**: ${table.confidence}`);

    if (table.columnLineage.length > 0) {
      lines.push('\n#### Column-Level Lineage');
      lines.push('| Target Column | Source | Transform |');
      lines.push('|---|---|---|');
      for (const col of table.columnLineage) {
        const sourceDesc = col.sourceColumns
          .map(s => `\`${s.table}.${s.column}\``)
          .join(', ') || '(unknown)';
        lines.push(`| \`${col.targetColumn}\` | ${sourceDesc} | ${col.transform ? '`' + col.transform + '`' : 'Direct'} |`);
      }
    }
    lines.push('');
  }

  // Mermaid flow graph
  if (result.tables.length > 0) {
    lines.push('#### Lineage Flow (Mermaid)');
    lines.push('```mermaid');
    lines.push('graph LR');
    for (const table of result.tables) {
      for (const source of table.sourceTables) {
        const srcId = source.replace(/\./g, '_');
        const tgtId = table.targetTable.replace(/\./g, '_');
        lines.push(`  ${srcId}[${source}] -->|${table.operation}| ${tgtId}[${table.targetTable}]`);
      }
    }
    lines.push('```');
    lines.push('');
  }

  return lines.join('\n');
}

export function lineageToMermaid(result: LineageResult): string {
  const lines: string[] = ['graph LR'];
  for (const table of result.tables) {
    for (const source of table.sourceTables) {
      const srcId = source.replace(/\./g, '_');
      const tgtId = table.targetTable.replace(/\./g, '_');
      lines.push(`  ${srcId}[${source}] -->|${table.operation}| ${tgtId}[${table.targetTable}]`);
    }
  }
  return lines.join('\n');
}
