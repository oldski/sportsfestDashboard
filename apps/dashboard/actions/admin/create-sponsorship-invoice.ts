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
  OrderStatus,
  Role
} from '@workspace/database/schema';
import { sendSponsorshipInvoiceEmail } from '@workspace/email/send-sponsorship-invoice-email';
import { routes } from '@workspace/routes';

import { isSuperAdmin } from '~/lib/admin-utils';

// Validation schema
const createSponsorshipInvoiceSchema = z.object({
  organizationId: z.string().uuid('Invalid organization ID'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  baseAmount: z.number().min(1, 'Amount must be at least $1').max(1000000, 'Amount cannot exceed $1,000,000')
});

export type CreateSponsorshipInvoiceInput = z.infer<typeof createSponsorshipInvoiceSchema>;

export type CreateSponsorshipInvoiceResult = {
  success: boolean;
  orderId?: string;
  invoiceNumber?: string;
  error?: string;
};

/**
 * Calculate processing fee (Stripe fee passthrough: 2.9% + $0.30)
 */
function calculateProcessingFee(baseAmount: number): number {
  return Math.round((baseAmount * 0.029 + 0.30) * 100) / 100;
}

/**
 * Calculate total amount including processing fee
 */
function calculateTotal(baseAmount: number): number {
  return Math.round((baseAmount + calculateProcessingFee(baseAmount)) * 100) / 100;
}

/**
 * Create a sponsorship invoice for an organization
 */
export async function createSponsorshipInvoice(
  input: CreateSponsorshipInvoiceInput
): Promise<CreateSponsorshipInvoiceResult> {
  try {
    const { session } = await getAuthContext();

    if (!isSuperAdmin(session.user)) {
      return { success: false, error: 'Unauthorized: Only super admins can create sponsorship invoices' };
    }

    // Validate input
    const validatedData = createSponsorshipInvoiceSchema.parse(input);

    // Get active event year
    const [activeEventYear] = await db
      .select()
      .from(eventYearTable)
      .where(and(
        eq(eventYearTable.isActive, true),
        eq(eventYearTable.isDeleted, false)
      ));

    if (!activeEventYear) {
      return { success: false, error: 'No active event year found' };
    }

    // Get organization details
    const [organization] = await db
      .select({
        id: organizationTable.id,
        name: organizationTable.name,
        slug: organizationTable.slug
      })
      .from(organizationTable)
      .where(eq(organizationTable.id, validatedData.organizationId));

    if (!organization) {
      return { success: false, error: 'Organization not found' };
    }

    // Calculate amounts
    const baseAmount = validatedData.baseAmount;
    const processingFee = calculateProcessingFee(baseAmount);
    const totalAmount = calculateTotal(baseAmount);

    // Generate order number with SPO prefix for sponsorship
    const orderNumber = `SPO-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create order
    const [order] = await db
      .insert(orderTable)
      .values({
        orderNumber,
        organizationId: validatedData.organizationId,
        eventYearId: activeEventYear.id,
        status: OrderStatus.PENDING,
        totalAmount,
        depositAmount: 0,
        balanceOwed: totalAmount,
        isManuallyCreated: true,
        isSponsorship: true,
        notes: validatedData.description,
        metadata: {
          sponsorship: {
            baseAmount,
            processingFee,
            description: validatedData.description
          }
        }
      })
      .returning({ id: orderTable.id });

    // Generate invoice number
    const invoiceNumber = `SPO-INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create invoice with status 'sent'
    await db.insert(orderInvoiceTable).values({
      orderId: order.id,
      invoiceNumber,
      totalAmount,
      paidAmount: 0,
      balanceOwed: totalAmount,
      status: 'sent',
      sentAt: new Date(),
      notes: validatedData.description,
      metadata: {
        isSponsorship: true,
        baseAmount,
        processingFee
      }
    });

    // Get organization admins to send emails
    const orgAdmins = await db
      .select({
        email: userTable.email,
        name: userTable.name
      })
      .from(membershipTable)
      .innerJoin(userTable, eq(membershipTable.userId, userTable.id))
      .where(and(
        eq(membershipTable.organizationId, validatedData.organizationId),
        eq(membershipTable.role, Role.ADMIN)
      ));

    // Construct payment URL with openOrder param to auto-open the order modal
    const basePaymentUrl = routes.dashboard.organizations.slug.registration.Orders.replace('[slug]', organization.slug);
    const paymentUrl = `${basePaymentUrl}?openOrder=${order.id}`;

    // Send email to each org admin
    for (const admin of orgAdmins) {
      if (admin.email) {
        try {
          await sendSponsorshipInvoiceEmail({
            recipient: admin.email,
            recipientName: admin.name || 'Team Admin',
            organizationName: organization.name,
            invoiceNumber,
            baseAmount,
            processingFee,
            totalAmount,
            description: validatedData.description,
            eventYearName: activeEventYear.name,
            paymentUrl
          });
        } catch (emailError) {
          console.error(`Failed to send sponsorship email to ${admin.email}:`, emailError);
          // Continue with other admins even if one fails
        }
      }
    }

    // Revalidate relevant paths
    revalidatePath('/admin/event-registration/sponsorships');
    revalidatePath('/admin/event-registration/invoices');

    return {
      success: true,
      orderId: order.id,
      invoiceNumber
    };
  } catch (error) {
    console.error('Error creating sponsorship invoice:', error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Invalid input' };
    }

    return { success: false, error: 'Failed to create sponsorship invoice' };
  }
}

// Export fee calculation functions for use in UI
export { calculateProcessingFee, calculateTotal };
