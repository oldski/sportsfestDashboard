import { render } from '@react-email/render';

import { EmailProvider } from './provider';
import {
  JoinRequestEmail,
  type JoinRequestEmailProps
} from './templates/join-request-email';

export async function sendJoinRequestEmail(
  input: JoinRequestEmailProps & { recipient: string }
): Promise<void> {
  const component = JoinRequestEmail(input);
  const html = await render(component);
  const text = await render(component, { plainText: true });

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject: `Join request for ${input.organizationName}`,
    html,
    text
  });
}
