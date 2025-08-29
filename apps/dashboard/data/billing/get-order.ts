import 'server-only';

import type { OrderDto } from '~/types/dtos/order-dto';

export async function getOrder(): Promise<OrderDto | undefined> {
  // TODO: Update to use new event registration order system
  // The old billing order table has been replaced with the new event registration system
  // This function should be updated to work with the new orderTable schema
  return undefined;
}
