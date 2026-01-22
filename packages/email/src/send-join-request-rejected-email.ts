import { render } from '@react-email/render';

import { EmailProvider } from './provider';
import {
  JoinRequestRejectedEmail,
  type JoinRequestRejectedEmailProps
} from './templates/join-request-rejected-email';

export async function sendJoinRequestRejectedEmail(
  input: JoinRequestRejectedEmailProps & { recipient: string }
): Promise<void> {
  const component = JoinRequestRejectedEmail(input);
  const html = await render(component);
  const text = await render(component, { plainText: true });

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject: `Update on your request to join ${input.organizationName}`,
    html,
    text
  });
}
