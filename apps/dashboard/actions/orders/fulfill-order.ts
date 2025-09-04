'use server';

import { ForbiddenError, NotFoundError } from '@workspace/common/errors';
import { db, eq, and } from '@workspace/database/client';
import { 
  orderTable, 
  orderItemTable, 
  productTable, 
  companyTeamTable, 
  tentPurchaseTrackingTable,
  eventYearTable,
  ProductType,
  OrderStatus
} from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';

export interface OrderFulfillmentResult {
  success: boolean;
  message: string;
  createdTeams?: string[];
  trackedTents?: number;
}

export async function fulfillOrder(orderId: string): Promise<OrderFulfillmentResult> {
  const { session } = await getAuthContext();
  
  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can fulfill orders');
  }

  // Get order with items and products
  const order = await db
    .select({
      id: orderTable.id,
      organizationId: orderTable.organizationId,
      eventYearId: orderTable.eventYearId,
      status: orderTable.status
    })
    .from(orderTable)
    .where(eq(orderTable.id, orderId))
    .limit(1);

  if (!order[0]) {
    throw new NotFoundError('Order not found');
  }

  if (order[0].status === OrderStatus.FULLY_PAID) {
    return {
      success: false,
      message: 'Order has already been fulfilled'
    };
  }

  if (order[0].status === OrderStatus.PENDING) {
    return {
      success: false,
      message: 'Order must have at least one payment before fulfillment'
    };
  }

  // Get order items with product details
  const orderItems = await db
    .select({
      orderItemId: orderItemTable.id,
      quantity: orderItemTable.quantity,
      productId: productTable.id,
      productName: productTable.name,
      productType: productTable.type,
      maxQuantityPerOrg: productTable.maxQuantityPerOrg
    })
    .from(orderItemTable)
    .innerJoin(productTable, eq(orderItemTable.productId, productTable.id))
    .where(eq(orderItemTable.orderId, orderId));

  if (orderItems.length === 0) {
    return {
      success: false,
      message: 'No items found in order'
    };
  }

  const createdTeams: string[] = [];
  let trackedTents = 0;

  // Process each order item
  for (const item of orderItems) {
    switch (item.productType) {
      case ProductType.TEAM_REGISTRATION: {
        // Create company team(s) for team registrations
        for (let i = 0; i < item.quantity; i++) {
          const teamName = `${order[0].organizationId} Team ${i + 1}`;
          
          const [createdTeam] = await db
            .insert(companyTeamTable)
            .values({
              organizationId: order[0].organizationId,
              eventYearId: order[0].eventYearId,
              teamNumber: i + 1,
              name: teamName,
              isPaid: true
            })
            .returning({ id: companyTeamTable.id, name: companyTeamTable.name });

          createdTeams.push(createdTeam.name || `Team ${i + 1}`);
        }
        break;
      }

      case ProductType.TENT_RENTAL: {
        // Track tent purchases with limits
        const existingTentTracking = await db
          .select({
            currentCount: tentPurchaseTrackingTable.quantityPurchased
          })
          .from(tentPurchaseTrackingTable)
          .where(
            and(
              eq(tentPurchaseTrackingTable.organizationId, order[0].organizationId),
              eq(tentPurchaseTrackingTable.eventYearId, order[0].eventYearId)
            )
          )
          .limit(1);

        const currentTentCount = existingTentTracking[0]?.currentCount || 0;
        const newTentCount = currentTentCount + item.quantity;

        // Check 2-tent limit
        if (newTentCount > 2) {
          return {
            success: false,
            message: `Cannot fulfill tent order: Organization would exceed 2-tent limit (current: ${currentTentCount}, requested: ${item.quantity})`
          };
        }

        // Update or insert tent tracking
        if (existingTentTracking.length > 0) {
          await db
            .update(tentPurchaseTrackingTable)
            .set({
              quantityPurchased: newTentCount,
              remainingAllowed: 2 - newTentCount,
              updatedAt: new Date()
            })
            .where(
              and(
                eq(tentPurchaseTrackingTable.organizationId, order[0].organizationId),
                eq(tentPurchaseTrackingTable.eventYearId, order[0].eventYearId)
              )
            );
        } else {
          // First need to find the tent product
          const tentProduct = await db
            .select({ id: productTable.id })
            .from(productTable)
            .where(and(
              eq(productTable.type, ProductType.TENT_RENTAL),
              eq(productTable.eventYearId, order[0].eventYearId)
            ))
            .limit(1);
            
          if (tentProduct[0]) {
            await db
              .insert(tentPurchaseTrackingTable)
              .values({
                organizationId: order[0].organizationId,
                eventYearId: order[0].eventYearId,
                tentProductId: tentProduct[0].id,
                quantityPurchased: item.quantity,
                maxAllowed: 2,
                remainingAllowed: 2 - item.quantity
              });
          }
        }

        trackedTents += item.quantity;
        break;
      }

      case ProductType.MERCHANDISE:
      case ProductType.SERVICES:
      case ProductType.EQUIPMENT:
      default:
        // These don't require special fulfillment actions
        break;
    }
  }

  // Mark order as fully paid (fulfilled)
  await db
    .update(orderTable)
    .set({
      status: OrderStatus.FULLY_PAID,
      updatedAt: new Date()
    })
    .where(eq(orderTable.id, orderId));

  // Build success message
  let message = 'Order fulfilled successfully';
  if (createdTeams.length > 0) {
    message += `. Created ${createdTeams.length} team(s): ${createdTeams.join(', ')}`;
  }
  if (trackedTents > 0) {
    message += `. Tracked ${trackedTents} tent purchase(s)`;
  }

  return {
    success: true,
    message,
    createdTeams: createdTeams.length > 0 ? createdTeams : undefined,
    trackedTents: trackedTents > 0 ? trackedTents : undefined
  };
}