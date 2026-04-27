# API Test Matrix

| Category | Examples |
|---|---|
| Positive | valid create, valid update, valid search |
| Validation | missing required field, invalid enum, invalid date, length limit |
| Auth | missing token, invalid token, insufficient role |
| Business | duplicate key, invalid transition, insufficient balance, closed period |
| Data | not found, soft-deleted record, stale version |
| Idempotency | repeat request, duplicate client request id |
| Boundary | max page size, min/max amount, date window boundaries |
