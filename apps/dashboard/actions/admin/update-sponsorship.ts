'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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

const updateSponsorshipSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  baseAmount: z.number().min(1, 'Amount must be at least $1').max(1000000, 'Amount cannot exceed $1,000,000'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional()
});

export type UpdateSponsorshipInput = z.infer<typeof updateSponsorshipSchema>;

export type UpdateSponsorshipResult = {
  success: boolean;
  error?: string;
};

type AuditEntry = {
  action: 'created' | 'updated' | 'cancelled';
  userId: string;
  userName: string;
  timestamp: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  reason?: string;
};

function calculateProcessingFee(baseAmount: number): number {
  return Math.round((baseAmount * 0.029 + 0.30) * 100) / 100;
}

function calculateTotal(baseAmount: number): number {
  return Math.round((baseAmount + calculateProcessingFee(baseAmount)) * 100) / 100;
}

export async function updateSponsorship(
  input: UpdateSponsorshipInput
): Promise<UpdateSponsorshipResult> {
  try {
    const { session } = await getAuthContext();

    if (!isSuperAdmin(session.user)) {
      return { success: false, error: 'Unauthorized: Only super admins can update sponsorships' };
    }

    const validatedData = updateSponsorshipSchema.parse(input);

    // Get the existing order with invoice
    const [existingOrder] = await db
      .select({
        id: orderTable.id,
        orderNumber: orderTable.orderNumber,
        organizationId: orderTable.organizationId,
        eventYearId: orderTable.eventYearId,
        metadata: orderTable.metadata,
        notes: orderTable.notes,
        isSponsorship: orderTable.isSponsorship
      })
      .from(orderTable)
      .where(eq(orderTable.id, validatedData.orderId));

    if (!existingOrder) {
      return { success: false, error: 'Sponsorship not found' };
    }

    if (!existingOrder.isSponsorship) {
      return { success: false, error: 'This order is not a sponsorship' };
    }

    // Get the invoice to check payment status
    const [existingInvoice] = await db
      .select({
        id: orderInvoiceTable.id,
        invoiceNumber: orderInvoiceTable.invoiceNumber,
        paidAmount: orderInvoiceTable.paidAmount,
        status: orderInvoiceTable.status,
        metadata: orderInvoiceTable.metadata
      })
      .from(orderInvoiceTable)
      .where(eq(orderInvoiceTable.orderId, validatedData.orderId));

    if (!existingInvoice) {
      return { success: false, error: 'Invoice not found for this sponsorship' };
    }

    // Check if sponsorship has any payments
    if (existingInvoice.paidAmount > 0) {
      return { success: false, error: 'Cannot edit a sponsorship that has received payments' };
    }

    if (existingInvoice.status === 'paid' || existingInvoice.status === 'partial') {
      return { success: false, error: 'Cannot edit a paid or partially paid sponsorship' };
    }

    // Get organization details
    const [organization] = await db
      .select({
        id: organizationTable.id,
        name: organizationTable.name,
        slug: organizationTable.slug
      })
      .from(organizationTable)
      .where(eq(organizationTable.id, existingOrder.organizationId));

    if (!organization) {
      return { success: false, error: 'Organization not found' };
    }

    // Get event year
    const [eventYear] = await db
      .select({
        name: eventYearTable.name
      })
      .from(eventYearTable)
      .where(eq(eventYearTable.id, existingOrder.eventYearId));

    // Calculate new amounts
    const newBaseAmount = validatedData.baseAmount;
    const newProcessingFee = calculateProcessingFee(newBaseAmount);
    const newTotalAmount = calculateTotal(newBaseAmount);

    // Get previous values for audit trail
    const previousMetadata = existingOrder.metadata as any;
    const previousBaseAmount = previousMetadata?.sponsorship?.baseAmount || 0;
    const previousDescription = existingOrder.notes || previousMetadata?.sponsorship?.description || null;

    // Build changes object for audit trail
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    if (previousBaseAmount !== newBaseAmount) {
      changes.baseAmount = { from: previousBaseAmount, to: newBaseAmount };
    }
    if (previousDescription !== (validatedData.description || null)) {
      changes.description = { from: previousDescription, to: validatedData.description || null };
    }

    // Create audit entry
    const auditEntry: AuditEntry = {
      action: 'updated',
      userId: session.user.id,
      userName: session.user.name || session.user.email || 'Unknown',
      timestamp: new Date().toISOString(),
      changes
    };

    // Get existing audit trail or create new one
    const existingAuditTrail = (previousMetadata?.auditTrail as AuditEntry[]) || [];
    const newAuditTrail = [...existingAuditTrail, auditEntry];

    // Update order metadata
    const newOrderMetadata = {
      ...previousMetadata,
      sponsorship: {
        baseAmount: newBaseAmount,
        processingFee: newProcessingFee,
        description: validatedData.description
      },
      auditTrail: newAuditTrail
    };

    // Update order
    await db
      .update(orderTable)
      .set({
        totalAmount: newTotalAmount,
        balanceOwed: newTotalAmount,
        notes: validatedData.description,
        metadata: newOrderMetadata
      })
      .where(eq(orderTable.id, validatedData.orderId));

    // Update invoice metadata
    const existingInvoiceMetadata = existingInvoice.metadata as any;
    const newInvoiceMetadata = {
      ...existingInvoiceMetadata,
      isSponsorship: true,
      baseAmount: newBaseAmount,
      processingFee: newProcessingFee,
      auditTrail: newAuditTrail
    };

    // Update invoice
    await db
      .update(orderInvoiceTable)
      .set({
        totalAmount: newTotalAmount,
        balanceOwed: newTotalAmount,
        notes: validatedData.description,
        metadata: newInvoiceMetadata,
        sentAt: new Date() // Mark as re-sent
      })
      .where(eq(orderInvoiceTable.id, existingInvoice.id));

    // Get organization admins to send updated email
    const orgAdmins = await db
      .select({
        email: userTable.email,
        name: userTable.name
      })
      .from(membershipTable)
      .innerJoin(userTable, eq(membershipTable.userId, userTable.id))
      .where(and(
        eq(membershipTable.organizationId, organization.id),
        eq(membershipTable.role, Role.ADMIN)
      ));

    // Construct payment URL
    const basePaymentUrl = routes.dashboard.organizations.slug.registration.Orders.replace('[slug]', organization.slug);
    const paymentUrl = `${basePaymentUrl}?openOrder=${existingOrder.id}`;

    // Send updated email to each org admin
    for (const admin of orgAdmins) {
      if (admin.email) {
        try {
          await sendSponsorshipInvoiceEmail({
            recipient: admin.email,
            recipientName: admin.name || 'Team Admin',
            organizationName: organization.name,
            invoiceNumber: existingInvoice.invoiceNumber,
            baseAmount: newBaseAmount,
            processingFee: newProcessingFee,
            totalAmount: newTotalAmount,
            description: validatedData.description,
            eventYearName: eventYear?.name || 'Current Event',
            paymentUrl
          });
        } catch (emailError) {
          console.error(`Failed to send updated sponsorship email to ${admin.email}:`, emailError);
        }
      }
    }

    // Revalidate paths
    revalidatePath('/admin/event-registration/sponsorships');
    revalidatePath('/admin/event-registration/invoices');

    return { success: true };
  } catch (error) {
    console.error('Error updating sponsorship:', error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Invalid input' };
    }

    return { success: false, error: 'Failed to update sponsorship' };
  }
}
