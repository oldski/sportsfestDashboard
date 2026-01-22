import 'server-only';

import { db, sql, gte, and, eq } from '@workspace/database/client';
import {
  userTable,
  organizationTable,
  orderTable,
  membershipTable,
  OrderStatus
} from '@workspace/database/schema';

export type NewSignUp = {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: Date;
};

export type NewOrganization = {
  id: string;
  name: string;
  slug: string;
  ownerName: string | null;
  ownerEmail: string | null;
  createdAt: Date;
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  organizationName: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
};

export type OrdersByStatus = {
  status: string;
  count: number;
  totalAmount: number;
  orders: OrderSummary[];
};

export type DailyDigestStats = {
  periodStart: Date;
  periodEnd: Date;
  newSignUps: {
    count: number;
    users: NewSignUp[];
  };
  newOrganizations: {
    count: number;
    organizations: NewOrganization[];
  };
  orders: {
    totalCount: number;
    totalRevenue: number;
    byStatus: OrdersByStatus[];
  };
};

export async function getDailyDigestStats(): Promise<DailyDigestStats> {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Get new sign-ups
  const newUsers = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      createdAt: userTable.createdAt
    })
    .from(userTable)
    .where(gte(userTable.createdAt, twentyFourHoursAgo))
    .orderBy(userTable.createdAt);

  // Get new organizations with owner info
  // Using owner membership createdAt as org creation date since organization table doesn't have createdAt
  const newOrgs = await db
    .select({
      id: organizationTable.id,
      name: organizationTable.name,
      slug: organizationTable.slug,
      createdAt: membershipTable.createdAt,
      ownerName: userTable.name,
      ownerEmail: userTable.email
    })
    .from(organizationTable)
    .innerJoin(
      membershipTable,
      and(
        eq(membershipTable.organizationId, organizationTable.id),
        eq(membershipTable.isOwner, true)
      )
    )
    .innerJoin(userTable, eq(userTable.id, membershipTable.userId))
    .where(gte(membershipTable.createdAt, twentyFourHoursAgo))
    .orderBy(membershipTable.createdAt);

  // Get all orders from the last 24 hours
  const recentOrders = await db
    .select({
      id: orderTable.id,
      orderNumber: orderTable.orderNumber,
      status: orderTable.status,
      totalAmount: orderTable.totalAmount,
      createdAt: orderTable.createdAt,
      organizationName: organizationTable.name
    })
    .from(orderTable)
    .innerJoin(organizationTable, eq(organizationTable.id, orderTable.organizationId))
    .where(gte(orderTable.createdAt, twentyFourHoursAgo))
    .orderBy(orderTable.createdAt);

  // Group orders by status
  const ordersByStatusMap = new Map<string, OrdersByStatus>();

  // Initialize with all statuses (so we show 0 counts too for important ones)
  const importantStatuses = [
    OrderStatus.PENDING,
    OrderStatus.PAYMENT_PROCESSING,
    OrderStatus.CONFIRMED,
    OrderStatus.DEPOSIT_PAID,
    OrderStatus.FULLY_PAID,
    OrderStatus.CANCELLED,
    OrderStatus.REFUNDED
  ];

  for (const status of importantStatuses) {
    ordersByStatusMap.set(status, {
      status,
      count: 0,
      totalAmount: 0,
      orders: []
    });
  }

  // Populate with actual orders
  for (const order of recentOrders) {
    const statusGroup = ordersByStatusMap.get(order.status);
    if (statusGroup) {
      statusGroup.count++;
      statusGroup.totalAmount += Number(order.totalAmount) || 0;
      statusGroup.orders.push({
        id: order.id,
        orderNumber: order.orderNumber,
        organizationName: order.organizationName,
        status: order.status,
        totalAmount: Number(order.totalAmount) || 0,
        createdAt: order.createdAt
      });
    }
  }

  // Convert to array and filter out statuses with 0 count (except pending/processing)
  const ordersByStatus = Array.from(ordersByStatusMap.values()).filter(
    (group) =>
      group.count > 0 ||
      group.status === OrderStatus.PENDING ||
      group.status === OrderStatus.PAYMENT_PROCESSING
  );

  const totalRevenue = recentOrders.reduce(
    (sum, order) => sum + (Number(order.totalAmount) || 0),
    0
  );

  return {
    periodStart: twentyFourHoursAgo,
    periodEnd: now,
    newSignUps: {
      count: newUsers.length,
      users: newUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt
      }))
    },
    newOrganizations: {
      count: newOrgs.length,
      organizations: newOrgs.map((o) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        ownerName: o.ownerName,
        ownerEmail: o.ownerEmail,
        createdAt: o.createdAt
      }))
    },
    orders: {
      totalCount: recentOrders.length,
      totalRevenue,
      byStatus: ordersByStatus
    }
  };
}
