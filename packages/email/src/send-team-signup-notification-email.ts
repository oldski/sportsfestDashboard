import { render } from '@react-email/render';

import { EmailProvider } from './provider';
import {
  TeamSignupNotificationEmail,
  type TeamSignupNotificationEmailProps
} from './templates/team-signup-notification-email';

export async function sendTeamSignupNotificationEmail(
  input: TeamSignupNotificationEmailProps & { recipient: string }
): Promise<void> {
  const component = TeamSignupNotificationEmail(input);
  const html = await render(component);
  const text = await render(component, { plainText: true });

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject: `New team member signup for ${input.organizationName}`,
    html,
    text
  });
}