import 'server-only';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { db, eq, and, sql, or } from '@workspace/database/client';
import { 
  orderTable,
  orderItemTable,
  productTable,
  eventYearTable,
  companyTeamTable,
  OrderStatus
} from '@workspace/database/schema';

/**
 * Sync company teams from paid orders
 * Creates companyTeam records for teams that have been purchased but don't exist yet
 */
export async function syncCompanyTeams(): Promise<{ created: number; existing: number }> {
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

  const activeEventYear = activeEventYearResult[0];

  if (!activeEventYear) {
    return { created: 0, existing: 0 };
  }

  // Get total teams purchased from paid orders
  const teamsPurchasedResult = await db
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
        // Only count paid orders
        or(
          eq(orderTable.status, OrderStatus.FULLY_PAID),
          eq(orderTable.status, OrderStatus.DEPOSIT_PAID)
        ),
        // Only count team products
        or(
          sql`LOWER(${productTable.name}) LIKE '%team%'`,
          sql`LOWER(${productTable.name}) LIKE '%company team%'`
        )
      )
    );

  const totalTeamsPurchased = Number(teamsPurchasedResult[0]?.totalTeams || 0);


  if (totalTeamsPurchased === 0) {
    return { created: 0, existing: 0 };
  }

  // Get existing company teams for this org and event year
  const existingTeams = await db
    .select({
      id: companyTeamTable.id,
      teamNumber: companyTeamTable.teamNumber,
    })
    .from(companyTeamTable)
    .where(
      and(
        eq(companyTeamTable.organizationId, ctx.organization.id),
        eq(companyTeamTable.eventYearId, activeEventYear.id)
      )
    )
    .orderBy(companyTeamTable.teamNumber);

  const existingTeamNumbers = existingTeams.map(team => team.teamNumber);
  const existingCount = existingTeams.length;
  
  // Determine how many teams need to be created
  const teamsToCreate = totalTeamsPurchased - existingCount;

  if (teamsToCreate <= 0) {
    return { created: 0, existing: existingCount };
  }

  // Find the next available team numbers
  const newTeams = [];
  let nextTeamNumber = 1;

  for (let i = 0; i < teamsToCreate; i++) {
    // Find next available team number
    while (existingTeamNumbers.includes(nextTeamNumber)) {
      nextTeamNumber++;
    }
    
    newTeams.push({
      organizationId: ctx.organization.id,
      eventYearId: activeEventYear.id,
      teamNumber: nextTeamNumber,
      name: null, // Let users set custom names later
      isPaid: true, // These are created from paid orders
    });

    existingTeamNumbers.push(nextTeamNumber);
    nextTeamNumber++;
  }

  // Create the missing company teams
  if (newTeams.length > 0) {
    await db.insert(companyTeamTable).values(newTeams);
  }

  return { 
    created: newTeams.length, 
    existing: existingCount 
  };
}