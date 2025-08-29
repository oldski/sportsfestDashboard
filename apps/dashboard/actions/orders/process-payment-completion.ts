'use server';

import { db, eq } from '@workspace/database/client';
import { orderTable, orderPaymentTable } from '@workspace/database/schema';
import { fulfillOrder } from './fulfill-order';

export interface PaymentCompletionResult {
  success: boolean;
  message: string;
  orderFulfilled?: boolean;
  fulfillmentDetails?: any;
}

export async function processPaymentCompletion(orderId: string): Promise<PaymentCompletionResult> {
  try {
    // Get order details
    const order = await db
      .select({
        id: orderTable.id,
        totalAmount: orderTable.totalAmount,
        status: orderTable.status
      })
      .from(orderTable)
      .where(eq(orderTable.id, orderId))
      .limit(1);

    if (!order[0]) {
      return {
        success: false,
        message: 'Order not found'
      };
    }

    // Calculate total payments made
    const payments = await db
      .select({
        totalPaid: orderPaymentTable.amount
      })
      .from(orderPaymentTable)
      .where(eq(orderPaymentTable.orderId, orderId));

    const totalPaid = payments.reduce((sum, payment) => sum + payment.totalPaid, 0);
    const balanceRemaining = order[0].totalAmount - totalPaid;

    // Always attempt fulfillment on any payment (including deposits)
    // This allows teams to be created immediately after deposit payment
    let fulfillmentResult;
    let shouldFulfill = false;

    if (order[0].status === 'pending' && totalPaid > 0) {
      // First payment received - fulfill order to create teams/track resources
      shouldFulfill = true;
    }

    if (shouldFulfill) {
      fulfillmentResult = await fulfillOrder(orderId);
    }

    // Update order status based on payment amount
    if (totalPaid >= order[0].totalAmount) {
      // Fully paid
      await db
        .update(orderTable)
        .set({
          status: 'paid',
          updatedAt: new Date()
        })
        .where(eq(orderTable.id, orderId));

      return {
        success: true,
        message: 'Payment completed - order fully paid',
        orderFulfilled: fulfillmentResult?.success || false,
        fulfillmentDetails: fulfillmentResult
      };
    } else {
      // Partial payment (deposit received)
      await db
        .update(orderTable)
        .set({
          status: 'partial_payment',
          updatedAt: new Date()
        })
        .where(eq(orderTable.id, orderId));

      return {
        success: true,
        message: `Deposit payment received. Teams created and available for management. Balance remaining: $${balanceRemaining.toFixed(2)}`,
        orderFulfilled: fulfillmentResult?.success || false,
        fulfillmentDetails: fulfillmentResult
      };
    }
  } catch (error) {
    console.error('Error processing payment completion:', error);
    return {
      success: false,
      message: 'Failed to process payment completion'
    };
  }
}