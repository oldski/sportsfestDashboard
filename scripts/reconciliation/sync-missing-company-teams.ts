/**
 * Sync Missing Company Teams Script
 *
 * This script finds organizations that have purchased teams (via order items)
 * but don't have corresponding companyTeam records, and creates them.
 *
 * This is useful for fixing data after WooCommerce imports that didn't
 * create companyTeam records.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/reconciliation/sync-missing-company-teams.ts
 *
 * Options:
 *   --dry-run    Show what would be created without actually creating
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, sql, and, desc, or } from 'drizzle-orm';
import {
  orderTable,
  orderItemTable,
  productTable,
  companyTeamTable,
  organizationTable,
  eventYearTable,
  OrderStatus,
} from '../../packages/database/src/schema';

// ============================================
// Configuration
// ============================================

const DRY_RUN = process.argv.includes('--dry-run');

// ============================================
// Database Connection
// ============================================

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  console.error('Usage: DATABASE_URL="postgresql://..." npx tsx scripts/sync-missing-company-teams.ts');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

// ============================================
// Main Function
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('Sync Missing Company Teams Script');
  console.log('='.repeat(60));
  console.log(`DRY RUN: ${DRY_RUN ? 'YES (no changes will be made)' : 'NO (changes will be committed)'}`);
  console.log('='.repeat(60));

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
    console.log('No active event year found. Exiting.');
    await pool.end();
    return;
  }

  console.log(`\nActive Event Year: ${activeEventYear.name} (${activeEventYear.year})`);
  console.log(`Event Year ID: ${activeEventYear.id}\n`);

  // Get teams purchased per organization from order items
  const teamsPurchased = await db
    .select({
      organizationId: orderTable.organizationId,
      totalTeams: sql<number>`COALESCE(SUM(${orderItemTable.quantity}), 0)`.mapWith(Number),
    })
    .from(orderItemTable)
    .innerJoin(orderTable, eq(orderItemTable.orderId, orderTable.id))
    .innerJoin(productTable, eq(orderItemTable.productId, productTable.id))
    .where(
      and(
        eq(orderTable.eventYearId, activeEventYear.id),
        or(
          eq(orderTable.status, OrderStatus.FULLY_PAID),
          eq(orderTable.status, OrderStatus.DEPOSIT_PAID)
        ),
        or(
          sql`LOWER(${productTable.name}) LIKE '%team%'`,
          sql`LOWER(${productTable.name}) LIKE '%company team%'`
        )
      )
    )
    .groupBy(orderTable.organizationId);

  console.log(`Found ${teamsPurchased.length} organizations with team purchases.\n`);

  // Get existing company team counts per organization
  const existingTeams = await db
    .select({
      organizationId: companyTeamTable.organizationId,
      count: sql<number>`COUNT(*)`.mapWith(Number),
    })
    .from(companyTeamTable)
    .where(eq(companyTeamTable.eventYearId, activeEventYear.id))
    .groupBy(companyTeamTable.organizationId);

  const existingTeamMap = new Map(existingTeams.map(t => [t.organizationId, t.count]));

  // Find organizations with missing team records
  const orgsMissingTeams: Array<{ orgId: string; purchased: number; existing: number; missing: number }> = [];

  for (const org of teamsPurchased) {
    const existing = existingTeamMap.get(org.organizationId) || 0;
    const missing = org.totalTeams - existing;

    if (missing > 0) {
      orgsMissingTeams.push({
        orgId: org.organizationId,
        purchased: org.totalTeams,
        existing,
        missing,
      });
    }
  }

  if (orgsMissingTeams.length === 0) {
    console.log('All organizations have correct company team records. Nothing to sync.');
    await pool.end();
    return;
  }

  // Get organization names for display
  const orgIds = orgsMissingTeams.map(o => o.orgId);
  const orgsInfo = await db
    .select({
      id: organizationTable.id,
      name: organizationTable.name,
    })
    .from(organizationTable)
    .where(sql`${organizationTable.id} IN (${sql.join(orgIds.map(id => sql`${id}`), sql`, `)})`);

  const orgNameMap = new Map(orgsInfo.map(o => [o.id, o.name]));

  console.log('Organizations with missing company team records:\n');
  console.log('-'.repeat(60));

  let totalCreated = 0;

  for (const org of orgsMissingTeams) {
    const orgName = orgNameMap.get(org.orgId) || 'Unknown';
    console.log(`\n${orgName} (${org.orgId.slice(0, 8)}...)`);
    console.log(`  Purchased: ${org.purchased}, Existing: ${org.existing}, Missing: ${org.missing}`);

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would create ${org.missing} company team record(s)`);
      totalCreated += org.missing;
      continue;
    }

    // Get the highest existing team number for this org
    const highestTeam = await db
      .select({ teamNumber: companyTeamTable.teamNumber })
      .from(companyTeamTable)
      .where(
        and(
          eq(companyTeamTable.organizationId, org.orgId),
          eq(companyTeamTable.eventYearId, activeEventYear.id)
        )
      )
      .orderBy(desc(companyTeamTable.teamNumber))
      .limit(1);

    const startingNumber = highestTeam.length > 0 ? highestTeam[0].teamNumber + 1 : 1;

    // Create missing team records
    const teamsToCreate = [];
    for (let i = 0; i < org.missing; i++) {
      teamsToCreate.push({
        organizationId: org.orgId,
        eventYearId: activeEventYear.id,
        teamNumber: startingNumber + i,
        name: null,
        isPaid: true,
      });
    }

    await db.insert(companyTeamTable).values(teamsToCreate);
    console.log(`  Created ${org.missing} company team record(s) (Team #${startingNumber} - #${startingNumber + org.missing - 1})`);
    totalCreated += org.missing;
  }

  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`Organizations processed: ${orgsMissingTeams.length}`);
  console.log(`Company teams ${DRY_RUN ? 'would be ' : ''}created: ${totalCreated}`);
  console.log('\nDone!');

  await pool.end();
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
