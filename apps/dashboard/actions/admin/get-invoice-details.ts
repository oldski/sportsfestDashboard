'use server';

import { auth } from '@workspace/auth';
import { db, eq, and } from '@workspace/database/client';
import {
  orderInvoiceTable,
  orderTable,
  orderItemTable,
  orderPaymentTable,
  productTable,
  eventYearTable,
  organizationTable
} from '@workspace/database/schema';
import { isSuperAdmin } from '~/lib/admin-utils';
import type { RegistrationInvoiceDto } from '~/types/dtos/registration-invoice-dto';

const formatLocalDate = (date: Date): Date => {
  // Return as Date object for the DTO
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export async function getInvoiceDetails(invoiceId: string): Promise<RegistrationInvoiceDto | null> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Check if user is super admin (for admin context)
  const isAdmin = isSuperAdmin(session.user);

  try {
    console.log('🔍 Fetching invoice details for ID:', invoiceId);

    // Get invoice with order data
    const invoiceData = await db
      .select({
        id: orderInvoiceTable.id,
        invoiceNumber: orderInvoiceTable.invoiceNumber,
        orderId: orderInvoiceTable.orderId,
        totalAmount: orderInvoiceTable.totalAmount,
        paidAmount: orderInvoiceTable.paidAmount,
        balanceOwed: orderInvoiceTable.balanceOwed,
        status: orderInvoiceTable.status,
        dueDate: orderInvoiceTable.dueDate,
        paidAt: orderInvoiceTable.paidAt,
        sentAt: orderInvoiceTable.sentAt,
        downloadUrl: orderInvoiceTable.downloadUrl,
        notes: orderInvoiceTable.notes,
        createdAt: orderInvoiceTable.createdAt,
        updatedAt: orderInvoiceTable.updatedAt,
        orderNumber: orderTable.orderNumber,
        orderStatus: orderTable.status,
        orderTotalAmount: orderTable.totalAmount,
        orderCreatedAt: orderTable.createdAt,
        orderMetadata: orderTable.metadata,
        organizationId: orderTable.organizationId,
        organizationName: organizationTable.name,
        eventYearId: orderTable.eventYearId,
        eventYearName: eventYearTable.name,
        eventYear: eventYearTable.year,
      })
      .from(orderInvoiceTable)
      .innerJoin(orderTable, eq(orderInvoiceTable.orderId, orderTable.id))
      .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
      .innerJoin(eventYearTable, eq(orderTable.eventYearId, eventYearTable.id))
      .where(eq(orderInvoiceTable.id, invoiceId))
      .limit(1);

    console.log('📊 Query result:', invoiceData);

    if (!invoiceData || invoiceData.length === 0) {
      console.log('❌ No invoice data found');
      return null;
    }

    const invoice = invoiceData[0];
    console.log('✅ Invoice found:', invoice.invoiceNumber);

    // For organization context, verify the user has access to this organization
    if (!isAdmin) {
      const hasAccess = (session.user as any).memberships?.some(
        (m: any) => m.organizationId === invoice.organizationId
      );
      if (!hasAccess) {
        throw new Error('Unauthorized: You do not have access to this invoice');
      }
    }

    console.log('📦 Fetching order items for order:', invoice.orderId);

    // Get order items
    const items = await db
      .select({
        id: orderItemTable.id,
        productName: productTable.name,
        quantity: orderItemTable.quantity,
        unitPrice: orderItemTable.unitPrice,
        totalPrice: orderItemTable.totalPrice,
      })
      .from(orderItemTable)
      .leftJoin(productTable, eq(orderItemTable.productId, productTable.id))
      .where(eq(orderItemTable.orderId, invoice.orderId));

    console.log('📦 Found', items.length, 'order items');
    console.log('💳 Fetching payment history for order:', invoice.orderId);

    // Get payment history
    const paymentsResult = await db
      .select({
        id: orderPaymentTable.id,
        amount: orderPaymentTable.amount,
        paymentMethodType: orderPaymentTable.paymentMethodType,
        status: orderPaymentTable.status,
        paymentDate: orderPaymentTable.processedAt,
        transactionId: orderPaymentTable.stripePaymentIntentId,
        paymentType: orderPaymentTable.type,
        last4: orderPaymentTable.last4,
        failureReason: orderPaymentTable.failureReason,
      })
      .from(orderPaymentTable)
      .where(eq(orderPaymentTable.orderId, invoice.orderId));

    console.log('💳 Raw payments result:', paymentsResult);
    const payments = paymentsResult || [];
    console.log('💳 Found', payments.length, 'payments');

    // Extract coupon data from order metadata
    const metadata = invoice.orderMetadata as any;
    const appliedCoupon = metadata?.appliedCoupon;
    const couponDiscount = metadata?.couponDiscount || 0;
    const originalTotal = metadata?.originalTotal;

    console.log('🎟️ Coupon data:', { appliedCoupon, couponDiscount, originalTotal });
    console.log('🏗️ Building DTO...');

    // Build the DTO
    const invoiceDto: RegistrationInvoiceDto = {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      orderId: invoice.orderId,
      orderNumber: invoice.orderNumber,
      organizationName: invoice.organizationName,
      totalAmount: invoice.totalAmount,
      paidAmount: invoice.paidAmount,
      balanceOwed: invoice.balanceOwed,
      status: invoice.status as RegistrationInvoiceDto['status'],
      dueDate: invoice.dueDate ? formatLocalDate(invoice.dueDate) : undefined,
      paidAt: invoice.paidAt ? formatLocalDate(invoice.paidAt) : undefined,
      sentAt: invoice.sentAt ? formatLocalDate(invoice.sentAt) : undefined,
      downloadUrl: invoice.downloadUrl || undefined,
      notes: invoice.notes || undefined,
      createdAt: formatLocalDate(invoice.createdAt),
      updatedAt: formatLocalDate(invoice.updatedAt),
      eventYear: {
        id: invoice.eventYearId,
        name: invoice.eventYearName,
        year: invoice.eventYear,
      },
      order: {
        id: invoice.orderId,
        orderNumber: invoice.orderNumber,
        totalAmount: invoice.orderTotalAmount,
        originalTotal,
        status: invoice.orderStatus,
        createdAt: formatLocalDate(invoice.orderCreatedAt),
        appliedCoupon,
        couponDiscount,
        items: items.map(item => ({
          id: item.id,
          productName: item.productName || 'Unknown Product',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
        payments: payments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          method: payment.paymentMethodType || 'card',
          status: payment.status,
          paymentDate: payment.paymentDate ? formatLocalDate(payment.paymentDate) : new Date(),
          transactionId: payment.transactionId || undefined,
          paymentType: (payment.paymentType || 'full') as 'deposit' | 'full' | 'balance_payment',
          last4: payment.last4 || undefined,
          failureReason: payment.failureReason || undefined,
        })),
      },
    };

    console.log('✨ DTO built successfully for invoice:', invoiceDto.invoiceNumber);
    return invoiceDto;
  } catch (error) {
    console.error('❌ Error fetching invoice details:', error);
    throw error;
  }
}
