# Optimize Skill Command Prompt

Use this portable prompt when a user wants to create or optimize a standard skill for VS Code Copilot or OpenCode. 
The goal is to convert a raw skill idea into a rigorous, highly-structured skill prompt that follows best practices before the user actually runs the `create skill` command.

## Reference Inspirations
When optimizing the skill, draw upon these world-class frameworks:
- **Hello-Agents**: Incorporate proper AI-native context engineering, separation of concerns (skills vs. MCP protocols), and clear evaluation criteria.
- **GStack**: Ensure the skill uses strict Markdown, acts like a specific specialist role, focuses on shipping, and catches "AI slop".
- **OpenSpec**: Embed spec-driven development principles. The skill should encourage agreeing on artifacts (proposal, specs, design, tasks) before execution.
- **Superpowers**: Inject test-driven development (TDD) constraints, debugging workflows (4-phase root cause), step-by-step parallel execution, and strict verification checkpoints.

## Required Optimization Steps
1. **Analyze the Raw Intent**: Understand what specific capability the user wants this skill to provide.
2. **Define the Skill Persona & Scope**: Give the skill a clear boundary. What does it do? What does it *not* do?
3. **Structure the Skill Prompt**: Output a fully formatted Markdown prompt that includes:
   - **Name & Description**: A concise summary of the skill.
   - **Trigger Conditions**: When should this skill be used?
   - **Context Requirements**: What files, artifacts, or inputs must be provided?
   - **Execution Steps**: A step-by-step algorithmic workflow for the AI to follow (incorporating OpenSpec artifact agreements or Superpowers TDD cycles if applicable).
   - **Output Format**: Strict rules on how the AI should present the result.
   - **Safety & Verification**: Rules to prevent hallucination, enforce TDD, or require user sign-off (Karpathy principles).
4. **Present the Optimized Prompt**: Provide the final optimized skill prompt inside a markdown code block, so the user can easily copy it and use it with the `create skill` command.

## Safety Rules
- Do not execute the skill itself. Your job is to *write* the prompt for the skill.
- Keep the generated skill prompt portable, so it works in VS Code Copilot and OpenCode.
