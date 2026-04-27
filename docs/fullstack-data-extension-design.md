# Fullstack + Data Extension Design

This plugin version extends `@product-dev` from product documentation into a full engineering workflow assistant.

## Command Families

### Product Design

- `/brainstorm`
- `/feature`
- `/prd`
- `/journey`

### Frontend Development

- `/frontend`

Supported focus areas: React, TypeScript, Material UI, TailwindCSS, state management, API hooks, form validation, accessibility, performance, telemetry, unit/component/e2e tests.

### Backend Development

- `/backend`
- `/springboot`
- `/python`

Spring Boot support covers Controller, DTO, Service, Repository, Entity, Mapper, validation, exceptions, security, transactions, OpenAPI and tests.

Python support covers FastAPI/Flask, Pydantic, service/repository separation, SQLAlchemy/data access, pytest, async jobs and packaging.

### Data Development

- `/data`
- `/sql`
- `/dbschema`
- `/pipeline`

Supported engines include PostgreSQL, MaxCompute, BigQuery, Oracle, MySQL, SQL Server, Snowflake, Databricks and Hive. The prompt compiler requires dialect assumptions, quality checks, lineage, audit, partition/index strategy and rollback/backfill notes.

## Recommended Workflow

1. `/brainstorm` to generate ideas.
2. `/feature` to converge feature design.
3. `/prd` to produce executable requirements.
4. `/frontend`, `/springboot` or `/python` to produce implementation plan.
5. `/data`, `/sql`, `/dbschema`, `/pipeline` for data work.
6. `/test`, `/review`, `/quality`, `/release` to complete enterprise delivery.
