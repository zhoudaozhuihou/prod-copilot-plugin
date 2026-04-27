# Verification Patterns

## Code

- Typecheck passes.
- Lint passes.
- Unit or integration tests cover the changed behavior.
- No unrelated diffs.

## Frontend/UI

- DESIGN.md alignment checked.
- Loading, error, empty, disabled, and permission states considered.
- Accessibility and responsive behavior checked.
- Browser/manual visual check or screenshot evidence requested when relevant.

## Backend/API

- API contract updated.
- Validation and error handling covered.
- Security/authz behavior stated.
- Transaction and idempotency boundaries identified.
- Tests or contract checks listed.

## Data/SQL

- Dialect stated.
- Grain and driving table stated.
- Join cardinality reviewed.
- Partition/cost implications checked.
- DQ and reconciliation SQL included where applicable.
- Sensitive field handling stated.

## PRD/Ralph

- Stories are independently implementable.
- Acceptance criteria are concrete.
- Dependency ordering is explicit.
- `passes:false` is initial state until evidence exists.
