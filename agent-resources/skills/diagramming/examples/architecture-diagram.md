# Example Architecture Diagram

```mermaid
flowchart LR
  User[Business User] --> Web[React Web App]
  Web --> API[Spring Boot API]
  API --> DB[(PostgreSQL)]
  API --> Audit[(Audit Log)]
```
