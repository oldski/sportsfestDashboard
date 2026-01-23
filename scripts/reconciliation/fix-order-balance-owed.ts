/**
 * Fix Order Balance Owed Script
 *
 * This script finds orders with status 'fully_paid' that still have
 * a non-zero balanceOwed value and sets it to 0.
 *
 * This fixes a bug where balance completion payments weren't updating
 * the order's balanceOwed field, causing revenue calculations to be incorrect.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/reconciliation/fix-order-balance-owed.ts
 *
 * Options:
 *   --dry-run    Show what would be updated without actually updating
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, and, gt, sql } from 'drizzle-orm';
import {
  orderTable,
  organizationTable,
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
  console.error('Usage: DATABASE_URL="postgresql://..." npx tsx scripts/fix-order-balance-owed.ts');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

// ============================================
// Main Function
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('Fix Order Balance Owed Script');
  console.log('='.repeat(60));
  console.log(`DRY RUN: ${DRY_RUN ? 'YES (no changes will be made)' : 'NO (changes will be committed)'}`);
  console.log('='.repeat(60));

  // Find fully paid orders with non-zero balanceOwed
  const affectedOrders = await db
    .select({
      id: orderTable.id,
      orderNumber: orderTable.orderNumber,
      organizationId: orderTable.organizationId,
      organizationName: organizationTable.name,
      totalAmount: orderTable.totalAmount,
      balanceOwed: orderTable.balanceOwed,
      status: orderTable.status,
    })
    .from(orderTable)
    .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
    .where(
      and(
        eq(orderTable.status, OrderStatus.FULLY_PAID),
        gt(orderTable.balanceOwed, 0)
      )
    );

  if (affectedOrders.length === 0) {
    console.log('\n✅ No orders found with incorrect balanceOwed. All good!');
    await pool.end();
    return;
  }

  console.log(`\nFound ${affectedOrders.length} order(s) with incorrect balanceOwed:\n`);
  console.log('-'.repeat(60));

  let totalBalanceFixed = 0;

  for (const order of affectedOrders) {
    console.log(`\nOrder: ${order.orderNumber}`);
    console.log(`  Company: ${order.organizationName}`);
    console.log(`  ID: ${order.id}`);
    console.log(`  Total Amount: $${order.totalAmount.toFixed(2)}`);
    console.log(`  Current balanceOwed: $${order.balanceOwed.toFixed(2)} (should be $0.00)`);
    console.log(`  Status: ${order.status}`);

    totalBalanceFixed += order.balanceOwed;

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would set balanceOwed to $0.00`);
    } else {
      await db
        .update(orderTable)
        .set({
          balanceOwed: 0,
          updatedAt: new Date(),
        })
        .where(eq(orderTable.id, order.id));
      console.log(`  ✅ Updated balanceOwed to $0.00`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`Orders ${DRY_RUN ? 'to be ' : ''}fixed: ${affectedOrders.length}`);
  console.log(`Total balance ${DRY_RUN ? 'to be ' : ''}corrected: $${totalBalanceFixed.toFixed(2)}`);
  console.log(`\nThis will ${DRY_RUN ? '' : 'now '}increase reported revenue by $${totalBalanceFixed.toFixed(2)}`);
  console.log('\nDone!');

  await pool.end();
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
