import { db, eq } from '@workspace/database/client';
import { orderTable, OrderStatus } from '@workspace/database/schema';

export async function updateOrderStatus(
  id: string,
  status: 'succeeded' | 'failed'
): Promise<void> {
  const orderStatus = status === 'succeeded' ? OrderStatus.FULLY_PAID : OrderStatus.CANCELLED;
  await db.update(orderTable).set({ status: orderStatus }).where(eq(orderTable.id, id));
}
