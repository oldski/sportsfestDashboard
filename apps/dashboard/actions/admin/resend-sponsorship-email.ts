'use server';

import { getAuthContext } from '@workspace/auth/context';
import { db, eq, and } from '@workspace/database/client';
import {
  orderTable,
  orderInvoiceTable,
  organizationTable,
  membershipTable,
  userTable,
  eventYearTable,
  Role
} from '@workspace/database/schema';
import { sendSponsorshipInvoiceEmail } from '@workspace/email/send-sponsorship-invoice-email';
import { routes } from '@workspace/routes';

import { isSuperAdmin } from '~/lib/admin-utils';

export type ResendSponsorshipEmailResult = {
  success: boolean;
  emailsSent?: number;
  error?: string;
};

/**
 * Resend sponsorship invoice email to organization admins
 */
export async function resendSponsorshipEmail(
  invoiceId: string
): Promise<ResendSponsorshipEmailResult> {
  try {
    const { session } = await getAuthContext();

    if (!isSuperAdmin(session.user)) {
      return { success: false, error: 'Unauthorized: Only super admins can resend sponsorship emails' };
    }

    // Get invoice with order and organization details
    const [invoice] = await db
      .select({
        invoiceNumber: orderInvoiceTable.invoiceNumber,
        totalAmount: orderInvoiceTable.totalAmount,
        orderId: orderInvoiceTable.orderId,
        organizationId: organizationTable.id,
        organizationName: organizationTable.name,
        organizationSlug: organizationTable.slug,
        eventYearName: eventYearTable.name,
        orderMetadata: orderTable.metadata,
        notes: orderTable.notes
      })
      .from(orderInvoiceTable)
      .innerJoin(orderTable, eq(orderInvoiceTable.orderId, orderTable.id))
      .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
      .innerJoin(eventYearTable, eq(orderTable.eventYearId, eventYearTable.id))
      .where(eq(orderInvoiceTable.id, invoiceId));

    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    // Get sponsorship data from metadata
    const sponsorshipData = (invoice.orderMetadata as any)?.sponsorship;
    const baseAmount = sponsorshipData?.baseAmount || 0;
    const processingFee = sponsorshipData?.processingFee || 0;
    const description = invoice.notes || sponsorshipData?.description;

    // Get organization admins
    const orgAdmins = await db
      .select({
        email: userTable.email,
        name: userTable.name
      })
      .from(membershipTable)
      .innerJoin(userTable, eq(membershipTable.userId, userTable.id))
      .where(and(
        eq(membershipTable.organizationId, invoice.organizationId),
        eq(membershipTable.role, Role.ADMIN)
      ));

    if (orgAdmins.length === 0) {
      return { success: false, error: 'No organization admins found to send email to' };
    }

    // Construct payment URL with openOrder param to auto-open the order modal
    const basePaymentUrl = routes.dashboard.organizations.slug.registration.Orders.replace('[slug]', invoice.organizationSlug);
    const paymentUrl = `${basePaymentUrl}?openOrder=${invoice.orderId}`;

    // Send email to each org admin
    let emailsSent = 0;
    for (const admin of orgAdmins) {
      if (admin.email) {
        try {
          await sendSponsorshipInvoiceEmail({
            recipient: admin.email,
            recipientName: admin.name || 'Team Admin',
            organizationName: invoice.organizationName,
            invoiceNumber: invoice.invoiceNumber,
            baseAmount,
            processingFee,
            totalAmount: invoice.totalAmount,
            description,
            eventYearName: invoice.eventYearName,
            paymentUrl
          });
          emailsSent++;
        } catch (emailError) {
          console.error(`Failed to send sponsorship email to ${admin.email}:`, emailError);
        }
      }
    }

    if (emailsSent === 0) {
      return { success: false, error: 'Failed to send emails to any admins' };
    }

    return {
      success: true,
      emailsSent
    };
  } catch (error) {
    console.error('Error resending sponsorship email:', error);
    return { success: false, error: 'Failed to resend sponsorship email' };
  }
}
