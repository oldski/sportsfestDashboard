'use server';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { db, eq, and, sql } from '@workspace/database/client';
import { 
  companyTeamTable,
  playerTable,
  orderTable,
  tentPurchaseTrackingTable,
  eventYearTable,
  orderPaymentTable
} from '@workspace/database/schema';

export interface OrganizationDashboardStats {
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
      registrationOpen: eventYearTable.registrationOpen
    })
    .from(eventYearTable)
    .where(eq(eventYearTable.isActive, true))
    .orderBy(eventYearTable.year)
    .limit(1);

  const eventYear = currentEventYear[0];
  const eventYearId = eventYear?.id;

  // Get team statistics
  const teamStats = await db
    .select({
      totalTeams: sql<number>`count(*)`,
      activeEventYearTeams: sql<number>`count(*) filter (where ${eventYearId ? eq(companyTeamTable.eventYearId, eventYearId) : sql`false`})`
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

  // Get tent tracking for current event year
  let tentStats = {
    purchased: 0,
    maxAllowed: 2,
    remainingAllowed: 2,
    utilizationRate: 0
  };

  if (eventYearId) {
    const tentTracking = await db
      .select({
        tentCount: tentPurchaseTrackingTable.tentCount,
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

    if (tentTracking[0]) {
      const purchased = tentTracking[0].tentCount;
      const maxAllowed = tentTracking[0].maxAllowed;
      tentStats = {
        purchased,
        maxAllowed,
        remainingAllowed: maxAllowed - purchased,
        utilizationRate: Math.round((purchased / maxAllowed) * 100)
      };
    }
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
        eq(orderPaymentTable.status, 'completed')
      )
    );

  const totalAmount = Number(orderStats[0]?.totalAmount || 0);
  const paidAmount = Number(paymentStats[0]?.paidAmount || 0);
  const balanceOwed = Math.max(0, totalAmount - paidAmount);

  return {
    teams: {
      total: Number(teamStats[0]?.totalTeams || 0),
      activeEventYear: Number(teamStats[0]?.activeEventYearTeams || 0)
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
      registrationOpen: eventYear.registrationOpen
    } : {
      id: '',
      year: 0,
      name: 'No Active Event',
      registrationOpen: false
    }
  };
}