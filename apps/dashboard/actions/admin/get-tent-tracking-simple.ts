'use server';

import { auth } from '@workspace/auth';
import { db, sql, eq, and } from '@workspace/database/client';
import {
  tentPurchaseTracking,
  organizationTable,
  eventYearTable,
  product,
  order,
  orderItem,
  OrderStatus,
  ProductType
} from '@workspace/database/schema';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getActiveEventYear } from './get-event-year';
import type { TentTrackingData, TentAvailabilityData } from './get-tent-tracking';

// Real database queries for tent tracking data

export async function getTentTrackingSimple(): Promise<TentTrackingData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access tent tracking data');
  }

  try {
    // Get tent tracking data with organization and product details
    const tentPurchases = await db
      .select({
        id: tentPurchaseTracking.id,
        organizationId: tentPurchaseTracking.organizationId,
        organizationName: organizationTable.name,
        organizationSlug: organizationTable.slug,
        eventYearId: tentPurchaseTracking.eventYearId,
        eventYear: eventYearTable.year,
        eventYearName: eventYearTable.name,
        tentCount: tentPurchaseTracking.quantityPurchased,
        maxAllowed: tentPurchaseTracking.maxAllowed,
        companyTeamCount: tentPurchaseTracking.companyTeamCount,
        tentProductId: tentPurchaseTracking.tentProductId,
        tentProductName: product.name,
        createdAt: tentPurchaseTracking.createdAt,
        updatedAt: tentPurchaseTracking.updatedAt,
        isAtLimit: sql`${tentPurchaseTracking.remainingAllowed} = 0`,
      })
      .from(tentPurchaseTracking)
      .innerJoin(organizationTable, eq(tentPurchaseTracking.organizationId, organizationTable.id))
      .innerJoin(eventYearTable, eq(tentPurchaseTracking.eventYearId, eventYearTable.id))
      .innerJoin(product, eq(tentPurchaseTracking.tentProductId, product.id))
      .orderBy(tentPurchaseTracking.createdAt);

    // Get payment details for each organization's tent orders
    const enrichedData: TentTrackingData[] = [];

    for (const purchase of tentPurchases) {
      // Get order details for this organization's tent purchases
      const orderDetails = await db
        .select({
          orderNumber: order.orderNumber,
          totalAmount: sql`SUM(${orderItem.totalPrice})`,
          orderStatus: order.status,
          orderDate: order.createdAt
        })
        .from(order)
        .innerJoin(orderItem, eq(order.id, orderItem.orderId))
        .where(
          and(
            eq(order.organizationId, purchase.organizationId),
            eq(order.eventYearId, purchase.eventYearId),
            eq(orderItem.productId, purchase.tentProductId),
            sql`${order.status} IN ('fully_paid', 'deposit_paid')`
          )
        )
        .groupBy(order.id, order.orderNumber, order.status, order.createdAt)
        .orderBy(order.createdAt)
        .limit(1); // Get the most recent order

      const orderDetail = orderDetails[0];
      const totalAmount = Number(orderDetail?.totalAmount || 0);

      // Determine payment status
      let status: 'confirmed' | 'pending_payment' | 'partial_payment';
      let depositPaid = 0;
      let balanceOwed = totalAmount;

      if (orderDetail?.orderStatus === 'fully_paid') {
        status = 'confirmed';
        depositPaid = totalAmount;
        balanceOwed = 0;
      } else if (orderDetail?.orderStatus === 'deposit_paid') {
        status = 'partial_payment';
        depositPaid = totalAmount * 0.3; // Assuming 30% deposit
        balanceOwed = totalAmount - depositPaid;
      } else {
        status = 'pending_payment';
      }

      enrichedData.push({
        id: purchase.id,
        organizationId: purchase.organizationId,
        organizationName: purchase.organizationName,
        organizationSlug: purchase.organizationSlug,
        eventYearId: purchase.eventYearId,
        eventYear: purchase.eventYear,
        eventYearName: purchase.eventYearName,
        tentCount: purchase.tentCount,
        maxAllowed: purchase.maxAllowed,
        companyTeamCount: purchase.companyTeamCount,
        tentProductId: purchase.tentProductId,
        tentProductName: purchase.tentProductName,
        totalAmount,
        depositPaid,
        balanceOwed,
        status,
        purchaseDate: orderDetail?.orderDate?.toISOString().split('T')[0] || purchase.createdAt?.toISOString().split('T')[0] || '',
        createdAt: purchase.createdAt?.toISOString().split('T')[0] || '',
        updatedAt: purchase.updatedAt?.toISOString().split('T')[0] || '',
        isAtLimit: Boolean(purchase.isAtLimit),
        orderNumber: orderDetail?.orderNumber || ''
      });
    }

    return enrichedData;
  } catch (error) {
    console.error('Error fetching tent tracking data:', error);
    return [];
  }
}

export async function getTentAvailabilitySimple(): Promise<TentAvailabilityData | null> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access tent availability data');
  }

  try {
    // Get the active event year for display
    const activeEventYear = await getActiveEventYear();
    console.log('Active event year:', activeEventYear);

    if (!activeEventYear) {
      console.log('No active event year found');
      return null;
    }

    // Get tent inventory from the product table using Drizzle query
    console.log('Querying for tent products with eventYearId:', activeEventYear.id);
    const tentProductResult = await db
      .select({
        id: product.id,
        name: product.name,
        type: product.type,
        totalInventory: product.totalInventory,
        soldCount: sql`${product}.soldcount`.mapWith(Number),
        reservedCount: sql`${product}.reservedcount`.mapWith(Number),
      })
      .from(product)
      .where(
        and(
          eq(product.type, ProductType.TENT_RENTAL),
          eq(product.eventYearId, activeEventYear.id)
        )
      )
      .limit(1);

    console.log('tentProductResult array:', tentProductResult);
    console.log('tentProductResult length:', tentProductResult.length);
    console.log('tentProductResult[0]:', tentProductResult[0]);

    let tentProduct = tentProductResult[0];

    if (!tentProduct) {
      console.log('No tent product found for active event year, checking all tent products...');

      // Fallback: try to find any tent rental product
      const anyTentProductResult = await db
        .select({
          id: product.id,
          name: product.name,
          type: product.type,
          totalInventory: product.totalInventory,
          soldCount: sql`${product}.soldcount`.mapWith(Number),
          reservedCount: sql`${product}.reservedcount`.mapWith(Number),
        })
        .from(product)
        .where(eq(product.type, ProductType.TENT_RENTAL))
        .limit(1);

      tentProduct = anyTentProductResult[0];
      console.log('Any tent product found:', tentProduct);

      if (!tentProduct) {
        console.log('No tent rental products found at all');
        return null;
      }
    }

    const totalTents = Number(tentProduct.totalInventory || 0);

    // Get actual purchased tents for the active event year only
    const purchasedTentsQuery = await db
      .select({
        totalPurchased: sql`cast(COALESCE(SUM("quantityPurchased"), 0) as int)`.mapWith(Number)
      })
      .from(tentPurchaseTracking)
      .where(
        and(
          eq(tentPurchaseTracking.eventYearId, activeEventYear.id),
          eq(tentPurchaseTracking.tentProductId, tentProduct.id)
        )
      );

    const purchasedTents = Number(purchasedTentsQuery[0]?.totalPurchased || 0);
    const availableTents = Math.max(0, totalTents - purchasedTents - Number(tentProduct.reservedCount || 0));
    const utilizationRate = totalTents > 0
      ? Math.round((purchasedTents / totalTents) * 100)
      : 0;

    console.log('Inventory calculations for active event year:', {
      totalTents,
      purchasedTents,
      availableTents,
      utilizationRate,
      activeEventYearId: activeEventYear.id
    });

    // Get tracking statistics filtered by active event year
    let organizationsAtLimit = 0;
    let totalRevenue = 0;
    let pendingPayments = 0;

    try {
      // Count organizations at limit for active event year
      const limitQuery = await db
        .select({
          count: sql`cast(count(*) as int)`.mapWith(Number),
        })
        .from(tentPurchaseTracking)
        .where(
          and(
            eq(tentPurchaseTracking.eventYearId, activeEventYear.id),
            eq(tentPurchaseTracking.remainingAllowed, 0)
          )
        );

      organizationsAtLimit = Number(limitQuery[0]?.count || 0);

      // Get total revenue from actual orders for active event year
      const revenueQuery = await db
        .select({
          revenue: sql`cast(COALESCE(SUM("totalPrice"), 0) as numeric)`.mapWith(Number)
        })
        .from(orderItem)
        .innerJoin(order, eq(orderItem.orderId, order.id))
        .where(
          and(
            eq(order.eventYearId, activeEventYear.id),
            eq(orderItem.productId, tentProduct.id),
            sql`${order.status} IN ('fully_paid', 'deposit_paid')`
          )
        );

      totalRevenue = Number(revenueQuery[0]?.revenue || 0);

      console.log('Tracking stats calculated for active event year:', { organizationsAtLimit, totalRevenue, activeEventYearId: activeEventYear.id });
    } catch (statsError) {
      console.warn('Error calculating tracking stats, using defaults:', statsError);
    }

    return {
      eventYear: activeEventYear.year,
      eventYearName: activeEventYear.name,
      totalTents,
      purchasedTents,
      availableTents,
      utilizationRate,
      totalRevenue,
      organizationsAtLimit,
      pendingPayments,
    };
  } catch (error) {

    console.error('Error fetching tent availability data:', error);
    return null;
  }
}
