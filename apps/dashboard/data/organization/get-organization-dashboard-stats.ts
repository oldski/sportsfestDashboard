'use server';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { db, eq, and, sql } from '@workspace/database/client';
import {
  companyTeamTable,
  playerTable,
  orderTable,
  orderItemTable,
  productTable,
  tentPurchaseTrackingTable,
  eventYearTable,
  PaymentStatus,
  orderPaymentTable,
  ProductType
} from '@workspace/database/schema';
import { getOrganizationTeamCount } from './get-organization-team-count';

export interface OrganizationDashboardStats {
  organizationName: string;
  teams: {
    total: number;
    activeEventYear: number;
  };
  players: {
    total: number;
    activeEventYear: number;
  };
  tents: {
    purchased: number;
    maxAllowed: number;
    remainingAllowed: number;
    utilizationRate: number;
  };
  orders: {
    total: number;
    totalAmount: number;
    paidAmount: number;
    balanceOwed: number;
    activeEventYear: number;
  };
  currentEventYear: {
    id: string;
    year: number;
    name: string;
    registrationOpen: boolean;
    eventStartDate: Date;
    eventEndDate: Date;
    registrationClose: Date;
    locationName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number | null;
    longitude: number | null;
  };
}

export async function getOrganizationDashboardStats(): Promise<OrganizationDashboardStats> {
  const ctx = await getAuthOrganizationContext();

  // Get current event year
  const currentEventYear = await db
    .select({
      id: eventYearTable.id,
      year: eventYearTable.year,
      name: eventYearTable.name,
      registrationOpen: eventYearTable.registrationOpen,
      eventStartDate: eventYearTable.eventStartDate,
      eventEndDate: eventYearTable.eventEndDate,
      registrationClose: eventYearTable.registrationClose,
      locationName: eventYearTable.locationName,
      address: eventYearTable.address,
      city: eventYearTable.city,
      state: eventYearTable.state,
      zipCode: eventYearTable.zipCode,
      latitude: eventYearTable.latitude,
      longitude: eventYearTable.longitude,
    })
    .from(eventYearTable)
    .where(eq(eventYearTable.isActive, true))
    .orderBy(eventYearTable.year)
    .limit(1);

  const eventYear = currentEventYear[0];
  const eventYearId = eventYear?.id;

  // Get team statistics using paid orders as source of truth
  const teamCountResult = await getOrganizationTeamCount();

  // Also get total teams from all years (using companyTeam table for historical data)
  const totalTeamsAllYears = await db
    .select({
      totalTeams: sql<number>`count(*)`
    })
    .from(companyTeamTable)
    .where(eq(companyTeamTable.organizationId, ctx.organization.id));

  // Get player statistics
  const playerStats = await db
    .select({
      totalPlayers: sql<number>`count(*)`,
      activeEventYearPlayers: sql<number>`count(*) filter (where ${eventYearId ? eq(playerTable.eventYearId, eventYearId) : sql`false`})`
    })
    .from(playerTable)
    .where(eq(playerTable.organizationId, ctx.organization.id));

  // Get tent purchases from actual orders for current event year
  let tentStats = {
    purchased: 0,
    maxAllowed: 2,
    remainingAllowed: 2,
    utilizationRate: 0
  };

  if (eventYearId) {
    // Calculate purchased tents from completed orders
    const tentPurchases = await db
      .select({
        totalQuantity: sql<number>`coalesce(sum(${orderItemTable.quantity}), 0)`
      })
      .from(orderItemTable)
      .innerJoin(orderTable, eq(orderItemTable.orderId, orderTable.id))
      .innerJoin(productTable, eq(orderItemTable.productId, productTable.id))
      .innerJoin(orderPaymentTable, eq(orderTable.id, orderPaymentTable.orderId))
      .where(
        and(
          eq(orderTable.organizationId, ctx.organization.id),
          eq(orderTable.eventYearId, eventYearId),
          eq(productTable.type, ProductType.TENT_RENTAL),
          eq(orderPaymentTable.status, PaymentStatus.COMPLETED)
        )
      );

    const purchased = Number(tentPurchases[0]?.totalQuantity || 0);

    // Try to get max allowed from tracking table, fallback to default
    let maxAllowed = 2;
    const tentTracking = await db
      .select({
        maxAllowed: tentPurchaseTrackingTable.maxAllowed
      })
      .from(tentPurchaseTrackingTable)
      .where(
        and(
          eq(tentPurchaseTrackingTable.organizationId, ctx.organization.id),
          eq(tentPurchaseTrackingTable.eventYearId, eventYearId)
        )
      )
      .limit(1);

    if (tentTracking[0]?.maxAllowed) {
      maxAllowed = tentTracking[0].maxAllowed;
    }

    tentStats = {
      purchased,
      maxAllowed,
      remainingAllowed: Math.max(0, maxAllowed - purchased),
      utilizationRate: maxAllowed > 0 ? Math.round((purchased / maxAllowed) * 100) : 0
    };
  }

  // Get order statistics
  const orderStats = await db
    .select({
      totalOrders: sql<number>`count(*)`,
      totalAmount: sql<number>`coalesce(sum(${orderTable.totalAmount}), 0)`,
      activeEventYearOrders: sql<number>`count(*) filter (where ${eventYearId ? eq(orderTable.eventYearId, eventYearId) : sql`false`})`
    })
    .from(orderTable)
    .where(eq(orderTable.organizationId, ctx.organization.id));

  // Get payment statistics for balance calculation
  const paymentStats = await db
    .select({
      paidAmount: sql<number>`coalesce(sum(${orderPaymentTable.amount}), 0)`
    })
    .from(orderPaymentTable)
    .innerJoin(orderTable, eq(orderPaymentTable.orderId, orderTable.id))
    .where(
      and(
        eq(orderTable.organizationId, ctx.organization.id),
        eq(orderPaymentTable.status, PaymentStatus.COMPLETED)
      )
    );

  const totalAmount = Number(orderStats[0]?.totalAmount || 0);
  const paidAmount = Number(paymentStats[0]?.paidAmount || 0);
  const balanceOwed = Math.max(0, totalAmount - paidAmount);

  return {
    organizationName: ctx.organization.name,
    teams: {
      total: Number(totalTeamsAllYears[0]?.totalTeams || 0),
      activeEventYear: teamCountResult.totalTeamsPurchased
    },
    players: {
      total: Number(playerStats[0]?.totalPlayers || 0),
      activeEventYear: Number(playerStats[0]?.activeEventYearPlayers || 0)
    },
    tents: tentStats,
    orders: {
      total: Number(orderStats[0]?.totalOrders || 0),
      totalAmount,
      paidAmount,
      balanceOwed,
      activeEventYear: Number(orderStats[0]?.activeEventYearOrders || 0)
    },
    currentEventYear: eventYear ? {
      id: eventYear.id,
      year: eventYear.year,
      name: eventYear.name,
      registrationOpen: eventYear.registrationOpen <= new Date() && new Date() <= eventYear.registrationClose,
      eventStartDate: eventYear.eventStartDate,
      eventEndDate: eventYear.eventEndDate,
      registrationClose: eventYear.registrationClose,
      locationName: eventYear.locationName,
      address: eventYear.address,
      city: eventYear.city,
      state: eventYear.state,
      zipCode: eventYear.zipCode,
      latitude: eventYear.latitude,
      longitude: eventYear.longitude,
    } : {
      id: '',
      year: 0,
      name: 'No Active Event',
      registrationOpen: false,
      eventStartDate: new Date(),
      eventEndDate: new Date(),
      registrationClose: new Date(),
      locationName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      latitude: null,
      longitude: null,
    }
  };
}
