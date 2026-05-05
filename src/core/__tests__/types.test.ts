import { describe, it, expect } from 'vitest';
import { SqlDialect, SQL_DIALECT_LABELS } from '../types';

describe('SqlDialect', () => {
  it('should have all expected SQL dialect values', () => {
    expect(SqlDialect.PostgreSQL).toBe('postgresql');
    expect(SqlDialect.Oracle).toBe('oracle');
    expect(SqlDialect.BigQuery).toBe('bigquery');
    expect(SqlDialect.MaxCompute).toBe('maxcompute');
    expect(SqlDialect.MySQL).toBe('mysql');
    expect(SqlDialect.SQLServer).toBe('sqlserver');
    expect(SqlDialect.Snowflake).toBe('snowflake');
    expect(SqlDialect.Databricks).toBe('databricks');
    expect(SqlDialect.Hive).toBe('hive');
  });

  it('should have all enum values as unique strings', () => {
    const values = Object.values(SqlDialect);
    expect(new Set(values).size).toBe(values.length);
    expect(values.length).toBe(9);
  });
});

describe('SQL_DIALECT_LABELS', () => {
  it('should have a label for every dialect', () => {
    for (const dialect of Object.values(SqlDialect)) {
      expect(SQL_DIALECT_LABELS[dialect]).toBeDefined();
      expect(SQL_DIALECT_LABELS[dialect].length).toBeGreaterThan(0);
    }
  });

  it('should contain specific expected labels', () => {
    expect(SQL_DIALECT_LABELS[SqlDialect.PostgreSQL]).toBe('PostgreSQL');
    expect(SQL_DIALECT_LABELS[SqlDialect.BigQuery]).toBe('BigQuery');
    expect(SQL_DIALECT_LABELS[SqlDialect.MaxCompute]).toBe('MaxCompute / ODPS');
  });
});
