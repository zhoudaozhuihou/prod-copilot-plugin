/**
 * Product Dev Copilot Source Note
 *
 * File: src/prompt/output-schemas.ts
 * Purpose: Output schema registry. Forces every command to produce stable, reviewable sections.
 *
 * Usage rules:
 * - Keep business-specific thresholds and local governance rules out of source code.
 * - Put company/department/country/project/environment rules in .product-dev/policy-packs/.
 * - Keep command outputs deterministic, reviewable, and written to repository artifacts whenever possible.
 * - For banking/data workflows, always preserve traceability, privacy, auditability, rollback, and human review.
 */

import { ProductDevCommand } from '../core/types';

export function getOutputSchema(command: ProductDevCommand): string {
  const base = getBaseOutputSchema(command);
  const diagrams = getDiagramSchema(command);
  return [base, diagrams].filter(Boolean).join('\n\n');
}

function getBaseOutputSchema(command: ProductDevCommand): string {
  switch (command) {
    case 'code-graph':
      return `# Repository Code Graph Map

## 1. Graph Summary
## 2. Evidence Sources
Repo files, imports, manifests, routes, schemas, tests, git diff, attachments, and optional GitNexus/MCP output used.
## 3. Module / Package Graph
Include Mermaid flowchart where useful.
## 4. Functional Clusters
Table columns: Cluster, Purpose, Key Files, Entry Points, Dependencies, Risk Level.
## 5. Entry Points and Execution Flows
## 6. API / Data / UI Dependency Map
## 7. Cross-cutting Concerns
Auth, config, logging, observability, error handling, security, data access.
## 8. High-risk Coupling and Blind Spots
## 9. Suggested Agent Navigation Queries
## 10. Recommended Next Commands`;
    case 'impact-analysis':
      return `# Blast Radius Impact Analysis

## 1. Change / Diff Summary
## 2. Evidence Sources
## 3. Direct Impact
Table columns: File/Module, Change, Impact, Confidence, Evidence.
## 4. Transitive Impact / Call-chain Risk
## 5. API Contract Impact
## 6. Data / SQL / Schema Impact
## 7. Frontend / UX Impact
## 8. Test Impact and Required New Tests
## 9. Release / Rollback / Runbook Impact
## 10. Mermaid Impact Graph
## 11. Verification Plan
## 12. Safe Implementation Sequence
## 13. Next Commands`;
    case 'code-wiki':
      return `# Repository Code Wiki

## 1. Executive Architecture Summary
## 2. How To Navigate This Repository
## 3. Technology Stack
## 4. Module Map
## 5. Key Execution Flows
## 6. API / UI / Data Contracts
## 7. Build / Run / Test Commands
## 8. Diagrams
Architecture, dependency, and sequence diagrams in Mermaid.
## 9. Development Guardrails
## 10. Known Risks and Open Questions
## 11. How To Keep This Wiki Updated
## 12. Next Commands`;
    case 'policy-init':
      return `# Policy Pack Initialization

## 1. Purpose
## 2. Generated Folder Structure
## 3. Policy Layers
## 4. Recommended Policy Files
## 5. How Users Should Add Local Rules
## 6. Precedence and Override Rules
## 7. Next Command`;
    case 'policy-intake':
      return `# Policy Pack Intake

## 1. Scope To Configure
## 2. Company-level Questions
## 3. Department-level Questions
## 4. Country / Region-level Questions
## 5. Project-level Questions
## 6. Environment-level Questions
## 7. Required Files To Add
## 8. Missing Decisions
## 9. Next Command`;
    case 'policy-scan':
      return `# Policy Pack Scan

## 1. Scan Summary
## 2. Loaded Policy Files
## 3. Missing Recommended Files
## 4. Precedence Order
## 5. Warnings
## 6. Policy Areas Covered
## 7. Policy Areas Not Covered
## 8. Next Command`;
    case 'policy-review':
      return `# Policy Pack Review

## 1. Review Summary
## 2. Completeness Findings
## 3. Precedence / Conflict Findings
## 4. DQ Rule Findings
## 5. Quality Gate Findings
## 6. Privacy / Security Findings
## 7. Release / Runbook Findings
## 8. Required Policy Updates
## 9. Approval Readiness
## 10. Next Command`;
    case 'skill-init':
      return `# Custom Skill Registry Initialization

## 1. Purpose
## 2. Generated Folder Structure
## 3. Skill File Format
## 4. Example Skills
## 5. How Skills Auto-apply
## 6. How To Run A Skill Directly
## 7. Next Command`;
    case 'skill-scan':
      return `# Custom Skill Scan

## 1. Scan Summary
## 2. Loaded Skills
## 3. Applies-To Matrix
## 4. Trigger Keywords
## 5. Missing Metadata
## 6. Recommended Fixes
## 7. Next Command`;
    case 'skill-run':
      return `# Custom Skill Result

## 1. Skill Applied
## 2. Task Interpretation
## 3. Skill-guided Output
## 4. Risks and Missing Context
## 5. Recommended Actions
## 6. Next Command`;
    case 'resources-init':
      return `# Portable Agent Resource Initialization

## 1. Purpose
## 2. Generated Prompt Structure
## 3. Generated Skill Structure
## 4. Copilot Compatibility
## 5. OpenCode Compatibility
## 6. Migration Rules
## 7. Next Command`;
    case 'resources-scan':
      return `# Portable Agent Resource Scan

## 1. Scan Summary
## 2. Prompt Files
## 3. Skill Files
## 4. Copilot Files
## 5. OpenCode Files
## 6. Gaps and Conflicts
## 7. Next Command`;
    case 'skill-review':
      return `# Custom Skill Review

## 1. Review Summary
## 2. Skill Inventory
## 3. Metadata Findings
## 4. Instruction Quality Findings
## 5. Safety / Governance Findings
## 6. Missing Skills
## 7. Required Fixes
## 8. Recommended Improvements
## 9. Next Command`;
    case 'plan':
      return `# Ordered Delivery Plan\n\n## 1. Goal and Scope\n## 2. Repository / Context Summary\n## 3. Recommended Workflow Path\nTable columns: Step, Command, Required/Optional/Skip, Purpose, Input Artifact, Output Artifact, Exit Criteria.\n## 4. Track Selection\n### Product Track\n### Frontend Track\n### Backend Track\n### Data Track\n### QA / Security / Release Track\n## 5. Dependencies and Critical Path\n## 6. Risks and Assumptions\n## 7. Ralph Loop Plan\n## 8. Next Command`;
    case 'prompt':
      return `# Prompt Optimization Pack\n\n## 1. Original Intent\n## 2. Problems in the Current Prompt\n## 3. Optimized Prompt\nProvide a copy-ready prompt.\n## 4. Variables / Placeholders\n## 5. Required Context Inputs\n## 6. Output Schema\n## 7. Guardrails and Constraints\n## 8. Evaluation Rubric\n## 9. Example Usage\n## 10. Next Command`;
    case 'summarize':
      return `# Content Summary\n\n## 1. Executive Summary\n## 2. Key Points\n## 3. Important Decisions\n## 4. Risks and Concerns\n## 5. Open Questions\n## 6. Action Items\nTable columns: Action, Owner Role, Priority, Dependency, Evidence.\n## 7. One-page Version\n## 8. Next Command`;
    case 'compress':
      return `# Context Compression Pack\n\n## 1. Compressed Context Block\nCopy-ready compact context for another LLM/agent.\n## 2. Goal\n## 3. Current State\n## 4. Non-negotiable Constraints\n## 5. Repository / Architecture Facts\n## 6. Decisions Already Made\n## 7. Open Questions\n## 8. Exact Next Action\n## 9. Token-saving Notes\n## 10. Next Command`;
    case 'doc-review':
      return `# Content Review Report\n\n## 1. Review Summary\n## 2. Severity-ranked Findings\nTable columns: Severity, Finding, Evidence, Impact, Recommended Fix.\n## 3. Missing Context\n## 4. Consistency Issues\n## 5. Feasibility Issues\n## 6. Security / Compliance / Governance Issues\n## 7. Testability Issues\n## 8. Required Fixes\n## 9. Recommended Improvements\n## 10. Review Decision\n## 11. Next Command`;
    case 'rewrite':
      return `# Content Rewrite\n\n## 1. Rewritten Version\n## 2. Style and Audience Fit\n## 3. Structural Improvements\n## 4. Content Preserved\n## 5. Content Strengthened\n## 6. Remaining Gaps\n## 7. Suggested Title / Summary\n## 8. Next Command`;
    case 'checklist':
      return `# Execution Checklist\n\n## 1. Checklist Scope\n## 2. Pre-work Checklist\n## 3. Product / Requirement Checklist\n## 4. Frontend Checklist\n## 5. Backend Checklist\n## 6. Data / SQL Checklist\n## 7. Security / Compliance Checklist\n## 8. Testing Checklist\n## 9. Release Checklist\n## 10. Evidence Required\nTable columns: Item, Owner Role, Evidence, Pass/Fail Criteria, Blocker, Automation Opportunity.\n## 11. Next Command`;
    case 'brainstorm':
      return `# Product Brainstorming Report\n\n## 1. Problem Framing\n## 2. Target Users / Personas\n## 3. User Jobs To Be Done\n## 4. Opportunity Areas\n## 5. Feature Ideas Backlog\nTable columns: Idea, User Value, Business Value, Feasibility, Risk, Confidence.\n## 6. MVP Candidates\n## 7. Differentiation / Moat\n## 8. RICE Prioritization\n## 9. Experiment Plan\n## 10. Open Questions\n## 11. Recommended Next Step`;
    case 'feature':
      return `# Feature Design Document\n\n## 1. Feature Summary\n## 2. Business Goals\n## 3. User Stories\n## 4. Functional Scope\n## 5. Out of Scope\n## 6. User Flow\n## 7. Interaction Details\n## 8. States and Edge Cases\n## 9. Permission Model\n## 10. Data / API Dependencies\n## 11. Acceptance Criteria\n## 12. Metrics and Instrumentation\n## 13. Risks and Decisions`;
    case 'prd':
      return `# Product Requirements Document\n\n## 1. Overview\n## 2. Problem / Goal\n## 3. Goals and Non-goals\n## 4. Personas / Users\n## 5. User Journey\n## 6. User Stories\nEach story must include ID, title, type, description, acceptance criteria, priority, dependencies, and validation evidence. Stories should be small enough for one Ralph iteration.\n## 7. Functional Requirements\nNumber every FR.\n## 8. Non-functional Requirements\n## 9. API Dependencies\n## 10. Data Dependencies\n## 11. Permission, Privacy, and Audit Requirements\n## 12. Analytics / Instrumentation\n## 13. Acceptance Criteria\n## 14. Ralph Readiness Notes\nStory-size risks, dependency order, and recommended /story-split or /prd-json action.\n## 15. Risks\n## 16. Open Questions\n## 17. Next Command`;
    case 'story-split':
      return `# Ralph-sized Story Split\n\n## 1. Source Scope Summary\n## 2. Splitting Decisions\n## 3. Dependency-ordered Stories\nTable columns: Priority, Story ID, Title, Type, Description, Acceptance Criteria, Dependencies, Validation Evidence.\n## 4. Stories Too Large and How They Were Split\n## 5. Quality Checks Per Story\n## 6. Open Questions\n## 7. Next Command`;
    case 'prd-json':
      return `# Ralph prd.json Conversion\n\n## 1. Conversion Summary\n## 2. Assumptions\n## 3. prd.json\nProvide valid JSON for scripts/ralph/prd.json.\n## 4. Story Size / Dependency Validation\n## 5. Missing Context\n## 6. Next Command`;
    case 'ralph-readiness':
      return `# Ralph Loop Readiness Review\n\n## 1. Readiness Decision\nApproved / Approved with Conditions / Not Ready.\n## 2. Blocker Findings\n## 3. High Findings\n## 4. Medium / Low Findings\n## 5. PRD and prd.json Checks\n## 6. Story Size and Dependency Checks\n## 7. Quality Commands and Evidence\n## 8. progress.txt and AGENTS.md / CLAUDE.md Memory Checks\n## 9. Required Fixes Before Loop\n## 10. Next Command`;
    case 'journey':
      return `# User Journey Analysis\n\n## 1. Detected Entry Points\n## 2. Primary User Paths\n## 3. Step-by-step Journey Map\n## 4. Decision Points\n## 5. Friction Points\n## 6. Missing States\n## 7. Instrumentation Plan\n## 8. UX Improvement Recommendations`;
    case 'design-md':
    case 'ui-design':
      return `# DESIGN.md

## 1. Visual Theme & Atmosphere
## 2. Color Palette & Roles
## 3. Typography Rules
## 4. Component Stylings
## 5. Layout Principles
## 6. Depth & Elevation
## 7. Do's and Don'ts
## 8. Responsive Behavior
## 9. Agent Prompt Guide
## 10. Source Evidence and Assumptions
## 11. Next Command`;
    case 'frontend':
      return `# Frontend Design and Implementation Plan\n\n## 1. Requirement Summary\n## 2. Existing Frontend Context\n## 3. Page / Route Design\n## 4. Component Breakdown\n## 5. State Management\n## 6. API Integration Hooks\n## 7. Form Validation and Error Handling\n## 8. Loading / Empty / Error / Permission States\n## 9. Accessibility, i18n, and Responsive Design\n## 10. Performance Considerations\n## 11. Test Plan\n## 12. File-level Implementation Plan\n## 13. Code Scaffold\n## 14. Acceptance Criteria`;
    case 'backend':
      return `# Backend Service Design\n\n## 1. Requirement Summary\n## 2. Service Boundary\n## 3. Domain Model\n## 4. API Design\n## 5. Persistence Design\n## 6. Validation and Error Handling\n## 7. Transactions and Idempotency\n## 8. Security and Authorization\n## 9. Logging, Audit, Observability\n## 10. Test Strategy\n## 11. File-level Implementation Plan\n## 12. Risks and Open Questions`;
    case 'springboot':
      return `# Java Spring Boot Implementation Plan\n\n## 1. Scope and Assumptions\n## 2. Maven/Gradle Dependencies\n## 3. Package Structure\n## 4. Controller Layer\n## 5. DTO and Validation\n## 6. Service Layer\n## 7. Repository and Entity Layer\n## 8. Mapper and Converter\n## 9. Exception Handling\n## 10. Security and Permission Checks\n## 11. Transactions and Concurrency\n## 12. OpenAPI Contract\n## 13. Unit and Integration Tests\n## 14. Configuration and Profiles\n## 15. Code Scaffold`;
    case 'python':
      return `# Python Backend Implementation Plan\n\n## 1. Scope and Assumptions\n## 2. Framework Choice\n## 3. Project Structure\n## 4. Routes / Controllers\n## 5. Pydantic Schemas\n## 6. Service Layer\n## 7. Repository / Data Access Layer\n## 8. Database Migration\n## 9. Auth, Validation, and Error Handling\n## 10. Background Jobs / Async Design\n## 11. Tests with pytest\n## 12. Packaging and Runtime Commands\n## 13. Code Scaffold`;
    case 'data':
      return `# Data Development Plan\n\n## 1. Business/Data Requirement\n## 2. Source Systems\n## 3. Target Data Products\n## 4. Source-to-Target Mapping\n## 5. Logical and Physical Data Model\n## 6. Transformation Rules\n## 7. Data Quality Rules\n## 8. Lineage and Metadata\n## 9. Audit and Reconciliation\n## 10. Serving Layer / Data API\n## 11. Security and Privacy\n## 12. SLA, Monitoring, and Runbook\n## 13. Implementation Tasks`;
    case 'nl2sql':
      return `# Natural Language to SQL

## 1. Business Question
## 2. Dialect and Assumptions
## 3. Required Schema Context
## 4. Metric / Dimension / Grain Definition
## 5. Generated SQL
## 6. Join and Filter Explanation
## 7. Validation SQL
## 8. DQ / Reconciliation Checks
## 9. Performance Notes
## 10. Privacy / Access Risks
## 11. Open Questions
## 12. Next Command`;
    case 'sql-review':
      return `# SQL Review Report

## 1. Review Summary
## 2. Dialect and Execution Context
## 3. Correctness Findings
## 4. Join / Grain / Aggregation Findings
## 5. Performance Findings
## 6. Data Quality / Reconciliation Findings
## 7. Security / Privacy Findings
## 8. Maintainability Findings
## 9. Required Fixes
## 10. Rewritten SQL if Needed
## 11. Validation SQL
## 12. Decision
## 13. Next Command`;
    case 'sql':
      return `# SQL Design and Optimization Report\n\n## 1. Goal and Assumptions\n## 2. Dialect Detection\n## 3. Proposed SQL\n## 4. PostgreSQL Notes\n## 5. MaxCompute Notes\n## 6. BigQuery Notes\n## 7. Oracle Notes\n## 8. Join and Aggregation Safety\n## 9. Index / Partition / Cluster Strategy\n## 10. Performance Risks\n## 11. Validation Queries\n## 12. Rollback / Migration Notes`;
    case 'dbschema':
      return `# Database Schema Design\n\n## 1. Domain Model\n## 2. ERD Description\n## 3. Table Design\n## 4. Columns and Data Types\n## 5. Keys, Constraints, and Uniqueness\n## 6. Index Strategy\n## 7. Partition / Clustering Strategy\n## 8. Audit Columns\n## 9. Migration Script\n## 10. Rollback Script\n## 11. Engine-specific Notes\n## 12. Data Retention and Privacy`;
    case 'pipeline':
      return `# Data Pipeline Design\n\n## 1. Pipeline Purpose\n## 2. DAG / Flow Overview\n## 3. Source and Target Tables\n## 4. Scheduling and Dependencies\n## 5. Incremental Strategy and Watermark\n## 6. Idempotency and Deduplication\n## 7. Retry and Backoff\n## 8. Backfill Plan\n## 9. Data Quality Checks\n## 10. SLA and Monitoring\n## 11. Alerting and Incident Runbook\n## 12. Cost and Performance Controls`;
    case 'quality':
      return `# Engineering Quality Gates\n\n## 1. Product Quality Gates\n## 2. Frontend Quality Gates\n## 3. Backend Quality Gates\n## 4. API Quality Gates\n## 5. Data Quality Gates\n## 6. SQL Quality Gates\n## 7. Security and Compliance Gates\n## 8. Testing Gates\n## 9. Release Gates\n## 10. Definition of Done\n## 11. Automation Opportunities`;
    case 'task':
      return `# Implementation Task Breakdown\n\n## 1. Epic Summary\n## 2. Frontend Tasks\n## 3. Backend Tasks\n## 4. Spring Boot Tasks\n## 5. Python Tasks\n## 6. API Contract Tasks\n## 7. Data Tasks\n## 8. QA Tasks\n## 9. Security / Compliance Tasks\n## 10. Dependencies\n## 11. Jira-ready Stories\nTable columns: Story, Description, Acceptance Criteria, Owner Role, Estimate, Dependency, Priority.`;
    case 'api':
      return `# API Contract Design\n\n## 1. API Overview\n## 2. Resources\n## 3. Endpoints\n## 4. Request Schemas\n## 5. Response Schemas\n## 6. Error Codes\n## 7. Pagination / Filtering / Sorting\n## 8. Idempotency\n## 9. Authorization\n## 10. Audit Logging\n## 11. Compatibility Strategy\n## 12. OpenAPI Draft`;
    case 'review':
      return `# Enterprise Code Review Report\n\n## 1. Summary\n## 2. Critical Issues\n## 3. Security Issues\n## 4. Maintainability Issues\n## 5. Performance Issues\n## 6. Frontend Issues\n## 7. Backend Issues\n## 8. Data / SQL Issues\n## 9. Test Gaps\n## 10. API Contract Gaps\n## 11. PRD Alignment\n## 12. Required Changes\n## 13. Recommended Changes\n## 14. Approval Decision`;
    case 'test':
      return `# Test Plan\n\n## 1. Scope\n## 2. Functional Test Cases\n## 3. Frontend UI / E2E Test Cases\n## 4. Backend Unit and Integration Tests\n## 5. API Test Cases\n## 6. Data / SQL Test Cases\n## 7. Edge Cases\n## 8. Permission Tests\n## 9. Regression Tests\n## 10. Non-functional Tests\n## 11. Test Data\n## 12. Automation Recommendations`;
    case 'diff':
      return `# Product / Code Diff Impact Report\n\n## 1. Git Change Summary\n## 2. Functional Impact\n## 3. Frontend Impact\n## 4. Backend Impact\n## 5. Data / SQL Impact\n## 6. PRD Update Required\n## 7. Journey Update Required\n## 8. API Contract Impact\n## 9. Test Impact\n## 10. Release Note Candidates\n## 11. Risk Assessment\n## 12. Recommended Patch Plan`;
    case 'release':
      return `# Release Readiness Pack\n\n## 1. Release Summary\n## 2. User-visible Changes\n## 3. Frontend Changes\n## 4. Backend Changes\n## 5. Data Changes\n## 6. Go-live Checklist\n## 7. Risk Assessment\n## 8. Rollback Plan\n## 9. Monitoring Plan\n## 10. Stakeholder Communication\n## 11. Approval Checklist`;
    case 'intake':
      return `# Interactive Project Intake

## 1. Track Selection
## 2. Missing Business Context
## 3. Missing Frontend Context
## 4. Missing Backend Context
## 5. Missing Data Engineering Context
## 6. Missing Governance Context
## 7. Questions To Ask User
## 8. Next Command`;
    case 'context':
      return `# Project Context Capture

## 1. Captured User Answers
## 2. Extracted Facts
## 3. Assumptions
## 4. Missing Information
## 5. Project Profile Updates
## 6. Next Command`;
    case 'datacontract':
      return `# Bank Data Contract

## 1. Dataset Overview
## 2. Business Definition
## 3. Ownership and SLA
## 4. Grain and Keys
## 5. Schema and Field Definitions
Table columns: Field, Type, Nullable, Business Definition, Sensitivity, Allowed Values, DQ Rules.
## 6. Partition and Freshness Rules
## 7. Data Quality Rules
## 8. Privacy and Masking
## 9. Compatibility and Breaking Changes
## 10. Approval Workflow
## 11. Open Questions
## 12. Next Command`;
    case 'sttm':
      return `# Source-to-Target Mapping

## 1. Mapping Scope
## 2. Source Systems
## 3. Target Dataset
## 4. Mapping Table
Table columns: Source System, Source Table, Source Field, Target Table, Target Field, Transformation, Filter, Join Rule, Null/Default Handling, DQ Check, Owner.
## 5. Grain and Join Risk
## 6. Transformation Rules
## 7. Exception Handling
## 8. Reconciliation Rules
## 9. Open Questions
## 10. Next Command`;
    case 'dq':
      return `# Data Quality Rules

## 1. DQ Scope
## 2. Rule Inventory
Table columns: Rule, Dimension, Severity, Threshold, SQL Check, Exception Table, Owner, Alert Target.
## 3. Executable SQL Checks
## 4. Freshness and Volume Anomaly Checks
## 5. Referential Integrity Checks
## 6. Reconciliation-linked Checks
## 7. Monitoring and Alerting
## 8. Failure Handling
## 9. Open Questions
## 10. Next Command`;
    case 'reconcile':
      return `# Data Reconciliation Plan

## 1. Reconciliation Scope
## 2. Source vs Target Controls
## 3. Count Checks
## 4. Amount / Balance Checks
## 5. Business Key Checks
## 6. Duplicate and Missing Record Checks
## 7. Executable Reconciliation SQL
## 8. Tolerance and Severity
## 9. Exception Table and Manual Review
## 10. Evidence and Sign-off
## 11. Next Command`;
    case 'lineage':
      return `# Data Lineage Analysis

## 1. Lineage Scope
## 2. Table-level Lineage
## 3. Field-level Lineage
## 4. Transformation Rules
## 5. Sensitive Field Propagation
## 6. Downstream Impact
## 7. Mermaid Lineage Graph
## 8. Gaps and Assumptions
## 9. Next Command`;
    case 'sql-translate':
      return `# SQL Dialect Translation

## 1. Source Dialect and Target Dialect
## 2. Semantic Summary
## 3. Translated SQL
## 4. Function Mapping
## 5. Data Type Mapping
## 6. Date/Time and Timezone Changes
## 7. Window / Merge / Partition Changes
## 8. Validation SQL
## 9. Risks and Manual Checks
## 10. Next Command`;
    case 'migration':
      return `# Data Migration Plan

## 1. Migration Scope
## 2. Current and Target State
## 3. DDL Diff
## 4. Historical Load Plan
## 5. Incremental Sync Plan
## 6. Dual-run / Parallel Validation
## 7. Rollback Plan
## 8. Data Validation and Reconciliation
## 9. Release Gates
## 10. Next Command`;
    case 'scheduler':
      return `# Scheduler Design

## 1. DAG Overview
## 2. Task Dependency Map
## 3. Schedule and SLA
## 4. Retry and Timeout Policy
## 5. Resource Queue and Concurrency
## 6. Backfill and Rerun Strategy
## 7. Alerting and Escalation
## 8. Manual Intervention Points
## 9. Next Command`;
    case 'privacy':
      return `# Data Privacy Assessment

## 1. Data Classification
## 2. Sensitive Field Inventory
## 3. Masking and Tokenization Rules
## 4. Access Control
## 5. Audit Logging
## 6. Retention and Deletion
## 7. Cross-border / Regulatory Constraints
## 8. Approval Evidence
## 9. Residual Risk
## 10. Next Command`;
    case 'data-test':
      return `# Data Test Plan

## 1. Test Scope
## 2. Schema Tests
## 3. SQL Unit Tests
## 4. Snapshot Tests
## 5. DQ Tests
## 6. Reconciliation Tests
## 7. Regression Tests
## 8. Mock / Synthetic Data
## 9. CI Integration
## 10. Next Command`;
    case 'data-review':
      return `# Bank Data Engineering Review

## 1. Review Summary
## 2. Blocker Findings
## 3. High / Medium / Low Findings
## 4. Grain and Join Review
## 5. SQL Correctness and Performance
## 6. DQ and Reconciliation Review
## 7. Lineage and Privacy Review
## 8. Scheduler and Runbook Review
## 9. Release Risk
## 10. Approval Decision
## 11. Next Command`;
    case 'catalog':
      return `# Data Catalog Entry

## 1. Dataset Summary
## 2. Business Glossary
## 3. Owner and Support
## 4. Schema Summary
## 5. Freshness and SLA
## 6. Quality Score and Known Issues
## 7. Sensitivity and Access
## 8. Downstream Consumers
## 9. Example Queries
## 10. Next Command`;
    case 'semantic':
      return `# Semantic Layer and Agent-readable Data Card

## 1. Business Domain
## 2. Metrics
## 3. Dimensions
## 4. Business Formulas
## 5. Join Rules
## 6. Aggregation Rules
## 7. Allowed Questions
## 8. Forbidden Questions
## 9. Agent-readable Data Card
## 10. Governance
## 11. Next Command`;
    case 'cost':
      return `# Data Cost Optimization Plan

## 1. Current Cost Drivers
## 2. Query Scan Optimization
## 3. Partition and Clustering Strategy
## 4. Materialization and Caching
## 5. Resource Queue / Warehouse Sizing
## 6. Storage Lifecycle
## 7. SQL Rewrite Recommendations
## 8. Cost KPIs
## 9. Next Command`;
    case 'runbook':
      return `# Data Production Runbook

## 1. Service / Job Overview
## 2. Normal Operations
## 3. Failure Scenarios
## 4. Diagnostics
## 5. Rerun Procedure
## 6. Backfill Procedure
## 7. Data Delay Procedure
## 8. Reconciliation Failure Procedure
## 9. Downstream Notification
## 10. Escalation
## 11. Evidence Capture
## 12. Next Command`;
    default:
      return `# Product Dev Copilot Help\n\nList available commands and examples.`;
  }
}


function getDiagramSchema(command: ProductDevCommand): string {
  const diagramCommands: ProductDevCommand[] = ['architecture-diagram', 'journey-diagram', 'diagram'];
  const diagramAware: ProductDevCommand[] = [
    'code-graph', 'impact-analysis', 'code-wiki',
    'plan', 'brainstorm', 'feature', 'prd', 'story-split', 'journey', 'design-md', 'ui-design',
    'frontend', 'backend', 'springboot', 'python', 'api', 'data', 'datacontract', 'sttm',
    'dbschema', 'sql', 'nl2sql', 'sql-review', 'sql-translate', 'dq', 'reconcile', 'lineage',
    'pipeline', 'scheduler', 'privacy', 'data-test', 'data-review', 'semantic', 'catalog',
    'migration', 'quality', 'task', 'test', 'review', 'diff', 'release', 'runbook', 'ralph-readiness'
  ];
  if (command === 'architecture-diagram') {
    return `# Architecture Diagram Pack

## 1. Diagram Inventory
Table columns: Diagram, Purpose, Source Evidence, Mermaid Type, Owner, Update Trigger.
## 2. System Context Diagram
Use Mermaid \`flowchart\` or \`C4Context\` when supported.
## 3. Container / Component Diagram
## 4. Deployment / Runtime Topology Diagram
## 5. API / Integration Sequence Diagram
## 6. Data Flow Diagram
## 7. Security / Trust Boundary Diagram
## 8. Observability / Failure Flow Diagram
## 9. Assumptions and Missing Architecture Context
## 10. How To Keep Diagrams Updated
## 11. Next Command`;
  }
  if (command === 'journey-diagram') {
    return `# User Journey Diagram Pack

## 1. Diagram Inventory
Table columns: Diagram, Purpose, Source Evidence, Mermaid Type, Owner, Update Trigger.
## 2. Primary User Journey Map
Use Mermaid \`journey\` when suitable.
## 3. User Flow Diagram
Use Mermaid \`flowchart\`.
## 4. Decision / State Transition Diagram
Use Mermaid \`stateDiagram-v2\` where applicable.
## 5. Sequence Diagram for Key Interaction
## 6. Funnel and Friction Diagram
## 7. Instrumentation / Analytics Event Flow
## 8. Accessibility and Error-state Coverage
## 9. Assumptions and Missing UX Context
## 10. Next Command`;
  }
  if (command === 'diagram') {
    return `# Project Diagram Pack

## 1. Diagram Decision Matrix
Choose only diagrams that help the current task. Explain included/skipped diagrams.
## 2. Architecture Diagrams
## 3. User Journey / Flow Diagrams
## 4. API / Sequence Diagrams
## 5. Data Model / Lineage / Pipeline Diagrams
## 6. Security / Privacy Boundary Diagrams
## 7. Release / Runbook / Incident Diagrams
## 8. Diagram Maintenance Rules
## 9. Next Command`;
  }
  if (!diagramAware.includes(command)) return '';
  return `# Required Diagrams

For this command, include diagrams only when they clarify implementation, review, or governance. Use Mermaid diagram-as-code.

## Diagram Decision
- Required diagrams:
- Optional diagrams skipped and why:

## Mermaid Diagrams
Include the smallest useful set. Each diagram must have purpose, source evidence, code block, interpretation notes, and update trigger.

Recommended diagram types by artifact:
- Product/PRD: user flow, journey map, system context, dependency map.
- Frontend/UI: route map, component hierarchy, state transition, interaction sequence.
- Backend/API: service boundary, request sequence, domain/component map, deployment topology.
- Data/SQL: ERD, lineage, pipeline DAG, DQ control flow, reconciliation flow, privacy boundary.
- Quality/Release/Runbook: gate flow, rollback flow, incident escalation flow.`;
}
