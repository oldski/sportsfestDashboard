import { render } from '@react-email/render';

import { EmailProvider } from './provider';
import {
  JoinRequestApprovedEmail,
  type JoinRequestApprovedEmailProps
} from './templates/join-request-approved-email';

export async function sendJoinRequestApprovedEmail(
  input: JoinRequestApprovedEmailProps & { recipient: string }
): Promise<void> {
  const component = JoinRequestApprovedEmail(input);
  const html = await render(component);
  const text = await render(component, { plainText: true });

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject: `Welcome to ${input.organizationName}!`,
    html,
    text
  });
}
