import { CommandArgs } from '../core/types';
import { runAiArtifactCommand, runLocalInfoCommand, streamResult } from '../commands/shared';
import { renderToolCommandTable, renderWorkflowTable } from '../workflow/workflow';

const LOCAL_COMMANDS = new Set(['attachments', 'backend-api-scan']);

export function normalizeCommand(command?: string): string {
  return (command || 'help').trim().replace(/^\//, '') || 'help';
}

export async function routeCommand(args: CommandArgs): Promise<void> {
  if (args.command === 'help') {
    args.stream.markdown(renderHelp());
    return;
  }

  if (LOCAL_COMMANDS.has(args.command)) {
    await runLocalInfoCommand(args, args.command);
    return;
  }

  const result = await runAiArtifactCommand(args, args.command);
  streamResult(args, result);
}

function renderHelp(): string {
  return `# @product-dev

## Core Workflows

${renderWorkflowTable()}

## Utility Commands

${renderToolCommandTable()}

## Backend API Test Generation

- \`/backend-api-scan\`: statically scan Spring Boot / Python route evidence.
- \`/api-test-gen\`: generate API request examples and automation tests from backend code.
- \`/springboot-api-tests\`: generate Spring Boot MockMvc / RestAssured / JUnit 5 tests.
- \`/python-api-tests\`: generate FastAPI / Flask pytest and HTTPX tests.

Use attachments, selected code, or an opened backend repository to provide source evidence.
`;
}
