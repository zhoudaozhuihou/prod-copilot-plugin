# SQL Review Rubric

## Blocker

Wrong grain, unsafe join amplification, missing critical date filter on large partitioned table, exposure of sensitive fields, SQL that cannot run in target dialect.

## High

Missing validation SQL, SCD2 join missing validity range, soft-delete filter missing, high-cost full scan, ambiguous metric definition.

## Medium

Maintainability issues, unclear aliases, repeated logic, missing comments for complex transformation.

## Low

Formatting, naming, minor simplification.

Each finding should include evidence, impact, fix, and validation.
