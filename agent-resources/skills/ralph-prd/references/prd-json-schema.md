# Ralph prd.json Schema

Required top-level fields:

- project: string
- branchName: string, must start with `ralph/`
- description: string
- userStories: array

Required userStories fields:

- id: `US-001`, `US-002`, ...
- title: string
- description: string
- acceptanceCriteria: string[]
- priority: number, dependency order first
- passes: false
- notes: empty string

Validation checks:

- JSON must parse.
- Story IDs must be unique and sequential.
- Priority values must be unique and ascending.
- No story may depend on a later story.
- Acceptance criteria cannot contain only vague statements.
