/** Command handler for @product-dev /attachments.
 *
 * Shows exactly what the extension can see from the current Chat attachments,
 * references, active editor selection, and surrounding code. This is useful when
 * users attach PRDs, SQL files, DDL, screenshots exported as text, or design docs
 * and want to confirm they are being used as context before running a workflow.
 */

import { CommandArgs, CommandResult } from '../core/types';
import { renderRequestContext } from '../context/request-context';

export async function runAttachmentsCommand(args: CommandArgs): Promise<CommandResult> {
  const markdown = renderRequestContext(args.requestContext);
  args.stream.markdown(`# Attachment / Request Context Scan\n\n${markdown}\n\n---\n\nNext recommended command: run the target command again, for example \`@product-dev /nl2sql ...\`, after confirming the attachments are visible.`);
  return {
    title: 'Attachment / Request Context Scan',
    content: markdown,
    nextCommand: 'Next recommended command: run your target workflow command with the same attachments.'
  };
}
