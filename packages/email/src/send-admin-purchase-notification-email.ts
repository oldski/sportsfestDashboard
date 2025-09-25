import { render } from '@react-email/render';

import { APP_NAME } from '@workspace/common/app';

import { EmailProvider } from './provider';
import {
  AdminPurchaseNotificationEmail,
  type AdminPurchaseNotificationEmailProps
} from './templates/admin-purchase-notification-email';

export async function sendAdminPurchaseNotificationEmail(
  input: AdminPurchaseNotificationEmailProps & { recipients: string[] }
): Promise<void> {
  const component = AdminPurchaseNotificationEmail(input);
  const html = await render(component);
  const text = await render(component, { plainText: true });

  const subject = input.isFullPayment
    ? `New Purchase: ${input.organizationName} - ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(input.paymentAmount)}`
    : `Payment Received: ${input.organizationName} - ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(input.paymentAmount)}`;

  // Send to all super admin recipients
  await Promise.all(
    input.recipients.map(recipient =>
      EmailProvider.sendEmail({
        recipient,
        subject,
        html,
        text
      })
    )
  );
}