import { render } from '@react-email/render';

import { EmailProvider } from './provider';
import {
  DailyDigestEmail,
  type DailyDigestEmailProps
} from './templates/daily-digest-email';

export async function sendDailyDigestEmail(
  input: DailyDigestEmailProps & { recipients: string[] }
): Promise<void> {
  const component = DailyDigestEmail(input);
  const html = await render(component);
  const text = await render(component, { plainText: true });

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  // Send to each recipient individually
  // Note: Could batch with BCC but sending individually allows for better tracking
  for (const recipient of input.recipients) {
    await EmailProvider.sendEmail({
      recipient,
      subject: `SportsFest Daily Digest - ${dateStr}`,
      html,
      text
    });
  }
}
