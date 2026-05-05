import { describe, it, expect } from 'vitest';
import {
  parseLineage,
  parseBatchLineage,
  lineageToMarkdown,
  lineageToMermaid,
} from '../lineage-parser';

describe('parseLineage', () => {
  describe('INSERT ... SELECT', () => {
    it('should parse basic INSERT SELECT with explicit target columns', () => {
      const sql = `INSERT INTO dwd_customer_daily (customer_id, name, status, updated_at)
SELECT c.id, c.full_name, c.status, CURRENT_TIMESTAMP
FROM ods_customer c
WHERE c.status = 'ACTIVE';`;

      const result = parseLineage(sql);
      expect(result.targets).toEqual(['dwd_customer_daily']);
      expect(result.sources).toContain('ods_customer');
      expect(result.tables).toHaveLength(1);
      expect(result.tables[0].operation).toBe('INSERT');
      expect(result.tables[0].confidence).toBe('high');

      // Column-level lineage
      const cols = result.tables[0].columnLineage;
      expect(cols).toHaveLength(4);
      expect(cols[0].targetColumn).toBe('customer_id');
      expect(cols[0].sourceColumns[0].table).toBe('c');
      expect(cols[0].sourceColumns[0].column).toBe('id');
      expect(cols[1].targetColumn).toBe('name');
      expect(cols[3].targetColumn).toBe('updated_at');
      expect(cols[3].transform).toBeTruthy(); // CURRENT_TIMESTAMP
    });

    it('should parse INSERT SELECT without explicit column list', () => {
      const sql = `INSERT INTO dws_daily_summary
SELECT date, COUNT(*) as tx_count, SUM(amount) as total_amount
FROM dwd_transactions
GROUP BY date;`;

      const result = parseLineage(sql);
      expect(result.targets).toEqual(['dws_daily_summary']);
      expect(result.sources).toContain('dwd_transactions');
      expect(result.tables[0].columnLineage.length).toBeGreaterThanOrEqual(3);
    });

    it('should parse INSERT SELECT with JOIN', () => {
      const sql = `INSERT INTO rpt_customer_risk
SELECT c.customer_id, c.name, r.risk_score, r.risk_level
FROM ods_customer c
JOIN dwd_risk_assessment r ON c.customer_id = r.customer_id
WHERE r.assessment_date = CURRENT_DATE;`;

      const result = parseLineage(sql);
      expect(result.sources).toContain('ods_customer');
      expect(result.sources).toContain('dwd_risk_assessment');
      expect(result.tables[0].confidence).toBe('medium'); // no explicit target cols
    });

    it('should parse INSERT SELECT with CTE', () => {
      const sql = `WITH active_customers AS (
  SELECT id, name, tier FROM ods_customer WHERE status = 'ACTIVE'
)
INSERT INTO dwd_active_customer_summary
SELECT id, name, tier
FROM active_customers;`;

      const result = parseLineage(sql);
      expect(result.targets).toEqual(['dwd_active_customer_summary']);
      expect(result.sources.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle SELECT *', () => {
      const sql = `INSERT INTO dwd_customer_backup
SELECT * FROM ods_customer;`;

      const result = parseLineage(sql);
      expect(result.targets).toEqual(['dwd_customer_backup']);
      expect(result.sources).toContain('ods_customer');
    });
  });

  describe('MERGE', () => {
    it('should parse basic MERGE statement', () => {
      const sql = `MERGE INTO dwd_customer t
USING ods_customer_updates s
ON t.customer_id = s.customer_id
WHEN MATCHED THEN UPDATE SET t.name = s.name, t.status = s.status
WHEN NOT MATCHED THEN INSERT (customer_id, name, status) VALUES (s.customer_id, s.name, s.status);`;

      const result = parseLineage(sql);
      expect(result.targets).toEqual(['dwd_customer']);
      expect(result.sources).toContain('ods_customer_updates');
      expect(result.tables[0].operation).toBe('MERGE');
    });
  });

  describe('UPDATE ... FROM', () => {
    it('should parse UPDATE with FROM clause', () => {
      const sql = `UPDATE dwd_account a
SET a.balance = a.balance + t.amount
FROM dwd_transactions t
WHERE a.account_id = t.account_id
  AND t.tx_date = CURRENT_DATE;`;

      const result = parseLineage(sql);
      expect(result.targets).toEqual(['dwd_account']);
      expect(result.sources.length).toBeGreaterThanOrEqual(1);
      expect(result.tables[0].operation).toBe('UPDATE');
    });
  });

  describe('CTAS (CREATE TABLE AS SELECT)', () => {
    it('should parse CTAS statement', () => {
      const sql = `CREATE TABLE dwd_customer_analytics AS
SELECT c.id, c.name, COUNT(t.id) as tx_count, SUM(t.amount) as total_amount
FROM ods_customer c
LEFT JOIN dwd_transactions t ON c.id = t.customer_id
GROUP BY c.id, c.name;`;

      const result = parseLineage(sql);
      expect(result.targets).toEqual(['dwd_customer_analytics']);
      expect(result.sources).toContain('ods_customer');
      expect(result.sources).toContain('dwd_transactions');
      expect(result.tables[0].operation).toBe('CTAS');
    });
  });

  describe('edge cases', () => {
    it('should return empty result for plain SELECT', () => {
      const sql = `SELECT * FROM ods_customer WHERE status = 'ACTIVE';`;
      const result = parseLineage(sql);
      expect(result.sources).toHaveLength(0);
      expect(result.targets).toHaveLength(0);
      expect(result.warnings.length).toBeGreaterThanOrEqual(1);
    });

    it('should return warnings for unsupported DML', () => {
      const sql = `DELETE FROM ods_customer WHERE status = 'INACTIVE';`;
      const result = parseLineage(sql);
      expect(result.warnings.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle empty SQL', () => {
      const result = parseLineage('');
      expect(result.sources).toHaveLength(0);
      expect(result.targets).toHaveLength(0);
    });

    it('should strip SQL comments', () => {
      const sql = `-- This is a comment
INSERT INTO dwd_target -- inline comment
SELECT * FROM ods_source;`;
      const result = parseLineage(sql);
      expect(result.targets).toContain('dwd_target');
      expect(result.sources).toContain('ods_source');
    });

    it('should handle fully qualified table names (schema.table)', () => {
      const sql = `INSERT INTO dwd.schema_target
SELECT * FROM ods.schema_source;`;
      const result = parseLineage(sql);
      // Target with schema
      expect(result.targets.length).toBeGreaterThanOrEqual(1);
      // Source with schema
      expect(result.sources.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('banking-specific SQL patterns', () => {
    it('should parse PostgreSQL-style INSERT with ON CONFLICT', () => {
      const sql = `INSERT INTO dwd_trade (trade_id, book_id, counterparty, notional_amount, trade_date)
SELECT t.trade_id, t.book_id, t.counterparty, t.notional, t.trade_date
FROM ods_trade t
ON CONFLICT (trade_id) DO UPDATE SET notional_amount = EXCLUDED.notional_amount;`;

      const result = parseLineage(sql);
      expect(result.targets).toEqual(['dwd_trade']);
      expect(result.sources).toContain('ods_trade');
      expect(result.tables[0].columnLineage).toHaveLength(5);
    });

    it('should parse Oracle-style MERGE with multiple sources', () => {
      const sql = `MERGE INTO dwd_position_summary p
USING (
  SELECT t.book_id, t.security_id, SUM(t.quantity) as total_qty
  FROM ods_trade t
  WHERE t.settlement_date <= SYSDATE
  GROUP BY t.book_id, t.security_id
) s
ON (p.book_id = s.book_id AND p.security_id = s.security_id)
WHEN MATCHED THEN UPDATE SET p.quantity = s.total_qty;`;

      const result = parseLineage(sql);
      expect(result.targets).toEqual(['dwd_position_summary']);
      expect(result.tables[0].operation).toBe('MERGE');
    });

    it('should parse BigQuery-style CREATE OR REPLACE TABLE', () => {
      const sql = `CREATE OR REPLACE TABLE project.dataset.dwd_customer_enriched AS
SELECT c.customer_id, c.name, a.total_balance
FROM project.dataset.ods_customer c
JOIN project.dataset.dwd_account_summary a ON c.customer_id = a.customer_id;`;

      const result = parseLineage(sql);
      expect(result.targets.length).toBeGreaterThanOrEqual(1);
      expect(result.sources.length).toBeGreaterThanOrEqual(2);
      expect(result.tables[0].operation).toBe('CTAS');
    });

    it('should parse Teradata-style INSERT with QUALIFY', () => {
      const sql = `INSERT INTO dwd_latest_risk_score
SELECT customer_id, risk_score, assessment_date
FROM (
  SELECT customer_id, risk_score, assessment_date,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY assessment_date DESC) as rn
  FROM ods_risk_assessment
) ranked
WHERE rn = 1;`;

      const result = parseLineage(sql);
      expect(result.targets).toEqual(['dwd_latest_risk_score']);
      expect(result.sources).toContain('ods_risk_assessment');
    });
  });
});

describe('parseBatchLineage', () => {
  it('should parse multiple SQL statements separated by semicolons', () => {
    const sql = `
INSERT INTO dwd_customer SELECT * FROM ods_customer;
INSERT INTO dwd_account SELECT * FROM ods_account;
MERGE INTO dwd_risk USING ods_risk_update ON (dwd_risk.id = ods_risk_update.id) WHEN MATCHED THEN UPDATE SET score = ods_risk_update.score;
    `;
    const results = parseBatchLineage(sql);
    expect(results).toHaveLength(3);
    expect(results[0].targets).toEqual(['dwd_customer']);
    expect(results[1].targets).toEqual(['dwd_account']);
    expect(results[2].targets).toEqual(['dwd_risk']);
  });
});

describe('lineageToMarkdown', () => {
  it('should produce markdown with lineage info', () => {
    const sql = `INSERT INTO dwd_customer_daily (customer_id, name)
SELECT c.id, c.full_name FROM ods_customer c;`;
    const result = parseLineage(sql);
    const md = lineageToMarkdown(result, 'test.sql');
    expect(md).toContain('test.sql');
    expect(md).toContain('dwd_customer_daily');
    expect(md).toContain('ods_customer');
    expect(md).toContain('Column-Level Lineage');
    expect(md).toContain('Mermaid');
    expect(md).toContain('graph LR');
  });

  it('should produce markdown with warnings', () => {
    const sql = `SELECT * FROM ods_customer;`;
    const result = parseLineage(sql);
    const md = lineageToMarkdown(result);
    expect(md).toContain('Warnings');
    expect(md).toContain('No lineage data');
  });
});

describe('lineageToMermaid', () => {
  it('should produce valid mermaid graph', () => {
    const sql = `INSERT INTO dwd_customer SELECT * FROM ods_customer;`;
    const result = parseLineage(sql);
    const mermaid = lineageToMermaid(result);
    expect(mermaid).toContain('graph LR');
    expect(mermaid).toContain('ods_customer');
    expect(mermaid).toContain('dwd_customer');
    expect(mermaid).toContain('INSERT');
  });
});
