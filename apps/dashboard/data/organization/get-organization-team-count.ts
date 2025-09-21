import 'server-only';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { db, eq, and, sql, or, like } from '@workspace/database/client';
import { 
  orderTable,
  orderItemTable,
  productTable,
  eventYearTable,
  OrderStatus
} from '@workspace/database/schema';

export interface TeamCountResult {
  totalTeamsPurchased: number;
  eventYear: {
    id: string;
    year: number;
    name: string;
  } | null;
}

/**
 * Get the count of teams purchased by the organization for the active event year
 * This is the source of truth - based on paid orders, not separate tracking tables
 */
export async function getOrganizationTeamCount(): Promise<TeamCountResult> {
  const ctx = await getAuthOrganizationContext();

  // Get the active event year
  const activeEventYearResult = await db
    .select({
      id: eventYearTable.id,
      year: eventYearTable.year,
      name: eventYearTable.name,
    })
    .from(eventYearTable)
    .where(and(
      eq(eventYearTable.isActive, true),
      eq(eventYearTable.isDeleted, false)
    ))
    .limit(1);

  const activeEventYear = activeEventYearResult[0] || null;

  if (!activeEventYear) {
    return {
      totalTeamsPurchased: 0,
      eventYear: null
    };
  }


  // Count teams from paid orders in the active event year
  const teamCount = await db
    .select({
      totalTeams: sql<number>`COALESCE(SUM(${orderItemTable.quantity}), 0)`
    })
    .from(orderItemTable)
    .innerJoin(orderTable, eq(orderItemTable.orderId, orderTable.id))
    .innerJoin(productTable, eq(orderItemTable.productId, productTable.id))
    .where(
      and(
        eq(orderTable.organizationId, ctx.organization.id),
        eq(orderTable.eventYearId, activeEventYear.id),
        // Only count paid orders (fully paid or deposit paid)
        or(
          eq(orderTable.status, OrderStatus.FULLY_PAID),
          eq(orderTable.status, OrderStatus.DEPOSIT_PAID)
        ),
        // Only count team products
        or(
          like(sql`LOWER(${productTable.name})`, '%team%'),
          like(sql`LOWER(${productTable.name})`, '%company team%')
        )
      )
    );

  return {
    totalTeamsPurchased: Number(teamCount[0]?.totalTeams || 0),
    eventYear: activeEventYear
  };
}