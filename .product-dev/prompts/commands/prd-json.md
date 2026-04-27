# PRD JSON Command Prompt

Convert PRD Markdown or feature design into Ralph-compatible `scripts/ralph/prd.json`.

## Contract

Return a conversion summary and valid JSON with:

- project
- branchName: `ralph/<feature-name>`
- description
- userStories[] with id, title, description, acceptanceCriteria, priority, passes:false, notes:""

## Validation

Check JSON parseability, story size, dependency ordering, acceptance criteria quality, and quality evidence.
