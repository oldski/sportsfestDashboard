'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getAuthContext } from '@workspace/auth/context';
import { db, eq } from '@workspace/database/client';
import {
  orderTable,
  orderInvoiceTable,
  OrderStatus
} from '@workspace/database/schema';

import { isSuperAdmin } from '~/lib/admin-utils';

const deleteSponsorshipSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional()
});

export type DeleteSponsorshipInput = z.infer<typeof deleteSponsorshipSchema>;

export type DeleteSponsorshipResult = {
  success: boolean;
  action?: 'deleted' | 'cancelled';
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

export async function deleteSponsorship(
  input: DeleteSponsorshipInput
): Promise<DeleteSponsorshipResult> {
  try {
    const { session } = await getAuthContext();

    if (!isSuperAdmin(session.user)) {
      return { success: false, error: 'Unauthorized: Only super admins can delete sponsorships' };
    }

    const validatedData = deleteSponsorshipSchema.parse(input);

    // Get the existing order
    const [existingOrder] = await db
      .select({
        id: orderTable.id,
        isSponsorship: orderTable.isSponsorship,
        metadata: orderTable.metadata
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
    const hasPayments = existingInvoice.paidAmount > 0;

    if (hasPayments) {
      // Cancel instead of delete - soft delete approach
      const auditEntry: AuditEntry = {
        action: 'cancelled',
        userId: session.user.id,
        userName: session.user.name || session.user.email || 'Unknown',
        timestamp: new Date().toISOString(),
        reason: validatedData.reason || 'Cancelled by admin'
      };

      // Get existing audit trail
      const existingMetadata = existingOrder.metadata as any;
      const existingAuditTrail = (existingMetadata?.auditTrail as AuditEntry[]) || [];
      const newAuditTrail = [...existingAuditTrail, auditEntry];

      // Update order metadata and status
      const newOrderMetadata = {
        ...existingMetadata,
        auditTrail: newAuditTrail,
        cancelledAt: new Date().toISOString(),
        cancelledBy: session.user.id,
        cancellationReason: validatedData.reason || 'Cancelled by admin'
      };

      await db
        .update(orderTable)
        .set({
          status: OrderStatus.CANCELLED,
          metadata: newOrderMetadata
        })
        .where(eq(orderTable.id, validatedData.orderId));

      // Update invoice metadata and status
      const existingInvoiceMetadata = existingInvoice.metadata as any;
      const newInvoiceMetadata = {
        ...existingInvoiceMetadata,
        auditTrail: newAuditTrail,
        cancelledAt: new Date().toISOString(),
        cancelledBy: session.user.id,
        cancellationReason: validatedData.reason || 'Cancelled by admin'
      };

      await db
        .update(orderInvoiceTable)
        .set({
          status: 'cancelled',
          metadata: newInvoiceMetadata
        })
        .where(eq(orderInvoiceTable.id, existingInvoice.id));

      // Revalidate paths
      revalidatePath('/admin/event-registration/sponsorships');
      revalidatePath('/admin/event-registration/invoices');

      return { success: true, action: 'cancelled' };
    } else {
      // No payments - hard delete
      // Delete invoice first (foreign key constraint)
      await db
        .delete(orderInvoiceTable)
        .where(eq(orderInvoiceTable.orderId, validatedData.orderId));

      // Delete order
      await db
        .delete(orderTable)
        .where(eq(orderTable.id, validatedData.orderId));

      // Revalidate paths
      revalidatePath('/admin/event-registration/sponsorships');
      revalidatePath('/admin/event-registration/invoices');

      return { success: true, action: 'deleted' };
    }
  } catch (error) {
    console.error('Error deleting sponsorship:', error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Invalid input' };
    }

    return { success: false, error: 'Failed to delete sponsorship' };
  }
}
