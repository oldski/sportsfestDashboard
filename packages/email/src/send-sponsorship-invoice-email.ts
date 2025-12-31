import { render } from '@react-email/render';

import { EmailProvider } from './provider';
import {
  SponsorshipInvoiceEmail,
  type SponsorshipInvoiceEmailProps
} from './templates/sponsorship-invoice-email';

export async function sendSponsorshipInvoiceEmail(
  input: SponsorshipInvoiceEmailProps & { recipient: string }
): Promise<void> {
  const component = SponsorshipInvoiceEmail(input);
  const html = await render(component);
  const text = await render(component, { plainText: true });

  const subject = `Sponsorship Invoice ${input.invoiceNumber} - ${input.eventYearName}`;

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject,
    html,
    text
  });
}
