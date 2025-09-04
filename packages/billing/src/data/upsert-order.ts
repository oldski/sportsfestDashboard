import { db, eq } from '@workspace/database/client';
import {
  orderItemTable,
  orderTable,
  organizationTable,
  OrderStatus
} from '@workspace/database/schema';

import type { UpsertOrder } from '../provider/types';

export async function upsertOrder(orderData: UpsertOrder): Promise<void> {
  if (!orderData.organizationId) {
    const [organization] = await db
      .select({ id: organizationTable.id })
      .from(organizationTable)
      .where(eq(organizationTable.billingCustomerId, orderData.customerId))
      .limit(1);

    if (!organization) {
      throw new Error(
        `Billing customer not found for customerId: ${orderData.customerId}`
      );
    }

    orderData.organizationId = organization.id;
  }

  const [existingOrder] = await db
    .select({ id: orderTable.id })
    .from(orderTable)
    .where(eq(orderTable.id, orderData.orderId))
    .limit(1);

  if (existingOrder) {
    await db
      .update(orderTable)
      .set({
        status: orderData.status as typeof OrderStatus[keyof typeof OrderStatus]
      })
      .where(eq(orderTable.id, orderData.orderId));
  } else {
    await db.insert(orderTable).values({
      organizationId: orderData.organizationId,
      eventYearId: '', // Default empty string since not in UpsertOrder type
      orderNumber: orderData.orderId, // Use orderId as order number
      status: orderData.status as typeof OrderStatus[keyof typeof OrderStatus],
      totalAmount: orderData.totalAmount,
      depositAmount: 0, // Default since not in UpsertOrder type
      balanceOwed: orderData.totalAmount // Initially, balance owed equals total
    });
  }

  for (const item of orderData.items) {
    const [existingItem] = await db
      .select({ id: orderItemTable.id })
      .from(orderItemTable)
      .where(eq(orderItemTable.id, item.orderItemId))
      .limit(1);

    if (existingItem) {
      await db
        .update(orderItemTable)
        .set({
          quantity: item.quantity,
          productId: item.productId,
          unitPrice: item.priceAmount || 0,
          totalPrice: (item.priceAmount || 0) * item.quantity,
          depositPrice: 0,
          productSnapshot: null
        })
        .where(eq(orderItemTable.id, item.orderItemId));
    } else {
      await db.insert(orderItemTable).values({
        orderId: orderData.orderId,
        quantity: item.quantity,
        productId: item.productId,
        unitPrice: item.priceAmount || 0,
        totalPrice: (item.priceAmount || 0) * item.quantity,
        depositPrice: 0,
        productSnapshot: null
      });
    }
  }
}
