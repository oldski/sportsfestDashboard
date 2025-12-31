'use server';

import { getAuthContext } from '@workspace/auth/context';
import { db, eq, desc } from '@workspace/database/client';
import {
  orderTable,
  orderInvoiceTable,
  organizationTable,
  eventYearTable
} from '@workspace/database/schema';

import { isSuperAdmin } from '~/lib/admin-utils';

export type SponsorshipData = {
  id: string;
  orderId: string;
  orderNumber: string;
  invoiceNumber: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  eventYearName: string;
  baseAmount: number;
  processingFee: number;
  totalAmount: number;
  paidAmount: number;
  balanceOwed: number;
  status: string;
  description: string | null;
  sentAt: string | null;
  paidAt: string | null;
  createdAt: string;
};

export async function getSponsorships(): Promise<SponsorshipData[]> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Super admin access required');
  }

  const sponsorships = await db
    .select({
      id: orderInvoiceTable.id,
      orderId: orderTable.id,
      orderNumber: orderTable.orderNumber,
      invoiceNumber: orderInvoiceTable.invoiceNumber,
      organizationId: organizationTable.id,
      organizationName: organizationTable.name,
      organizationSlug: organizationTable.slug,
      eventYearName: eventYearTable.name,
      totalAmount: orderInvoiceTable.totalAmount,
      paidAmount: orderInvoiceTable.paidAmount,
      balanceOwed: orderInvoiceTable.balanceOwed,
      status: orderInvoiceTable.status,
      sentAt: orderInvoiceTable.sentAt,
      paidAt: orderInvoiceTable.paidAt,
      createdAt: orderInvoiceTable.createdAt,
      orderMetadata: orderTable.metadata,
      notes: orderTable.notes
    })
    .from(orderTable)
    .innerJoin(orderInvoiceTable, eq(orderInvoiceTable.orderId, orderTable.id))
    .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
    .innerJoin(eventYearTable, eq(orderTable.eventYearId, eventYearTable.id))
    .where(eq(orderTable.isSponsorship, true))
    .orderBy(desc(orderInvoiceTable.createdAt));

  return sponsorships.map((s) => {
    const sponsorshipData = (s.orderMetadata as any)?.sponsorship;
    return {
      id: s.id,
      orderId: s.orderId,
      orderNumber: s.orderNumber,
      invoiceNumber: s.invoiceNumber,
      organizationId: s.organizationId,
      organizationName: s.organizationName,
      organizationSlug: s.organizationSlug,
      eventYearName: s.eventYearName,
      baseAmount: sponsorshipData?.baseAmount || 0,
      processingFee: sponsorshipData?.processingFee || 0,
      totalAmount: s.totalAmount,
      paidAmount: s.paidAmount,
      balanceOwed: s.balanceOwed,
      status: s.status,
      description: s.notes || sponsorshipData?.description || null,
      sentAt: s.sentAt?.toISOString() || null,
      paidAt: s.paidAt?.toISOString() || null,
      createdAt: s.createdAt.toISOString()
    };
  });
}
