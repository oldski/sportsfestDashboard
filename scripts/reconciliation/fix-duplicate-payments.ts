/**
 * Fix Duplicate Payments Script
 *
 * This script finds payment records with duplicate stripePaymentIntentId values
 * and removes the duplicates, keeping only the first record created.
 *
 * This fixes a race condition where both the confirm-payment route and the
 * Stripe webhook could create payment records for the same payment.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/reconciliation/fix-duplicate-payments.ts
 *
 * Options:
 *   --dry-run    Show what would be deleted without actually deleting
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, sql, and, inArray } from 'drizzle-orm';
import {
  orderPaymentTable,
  orderTable,
  orderInvoiceTable,
  organizationTable,
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
  console.error('Usage: DATABASE_URL="postgresql://..." npx tsx scripts/reconciliation/fix-duplicate-payments.ts');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

// ============================================
// Main Function
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('Fix Duplicate Payments Script');
  console.log('='.repeat(60));
  console.log(`DRY RUN: ${DRY_RUN ? 'YES (no changes will be made)' : 'NO (changes will be committed)'}`);
  console.log('='.repeat(60));

  // Find duplicate stripePaymentIntentIds
  const duplicates = await db.execute(sql`
    SELECT
      "stripePaymentIntentId",
      COUNT(*) as count,
      array_agg("id" ORDER BY "createdAt" ASC) as payment_ids,
      array_agg("orderId" ORDER BY "createdAt" ASC) as order_ids,
      array_agg("amount" ORDER BY "createdAt" ASC) as amounts,
      array_agg("createdAt" ORDER BY "createdAt" ASC) as created_dates
    FROM "orderPayment"
    WHERE "stripePaymentIntentId" IS NOT NULL
      AND "stripePaymentIntentId" != 'free_order'
    GROUP BY "stripePaymentIntentId"
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC
  `);

  if (duplicates.rows.length === 0) {
    console.log('\n✅ No duplicate payments found. All good!');
    await pool.end();
    return;
  }

  console.log(`\nFound ${duplicates.rows.length} stripePaymentIntentId(s) with duplicate payment records:\n`);
  console.log('-'.repeat(60));

  let totalDuplicates = 0;
  let totalAmountDuplicated = 0;
  const paymentsToDelete: string[] = [];

  for (const row of duplicates.rows) {
    const paymentIntentId = row.stripePaymentIntentId as string;
    const paymentIds = row.payment_ids as string[];
    const orderIds = row.order_ids as string[];
    const amounts = row.amounts as number[];
    const createdDates = row.created_dates as Date[];
    const count = Number(row.count);

    // Get order and organization info for the first order
    const [orderInfo] = await db
      .select({
        orderNumber: orderTable.orderNumber,
        organizationName: organizationTable.name,
      })
      .from(orderTable)
      .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
      .where(eq(orderTable.id, orderIds[0]))
      .limit(1);

    console.log(`\nStripe Payment Intent: ${paymentIntentId}`);
    console.log(`  Company: ${orderInfo?.organizationName || 'Unknown'}`);
    console.log(`  Order: ${orderInfo?.orderNumber || orderIds[0]}`);
    console.log(`  Duplicate count: ${count} records (should be 1)`);
    console.log(`  Payment amounts: ${amounts.map(a => `$${a.toFixed(2)}`).join(', ')}`);

    // Keep the first payment (oldest), delete the rest
    const keepId = paymentIds[0];
    const deleteIds = paymentIds.slice(1);

    const formatDate = (d: any) => {
      try {
        return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
      } catch {
        return String(d);
      }
    };

    console.log(`  Keeping: ${keepId} (created ${formatDate(createdDates[0])})`);
    console.log(`  Deleting: ${deleteIds.length} duplicate(s)`);

    for (let i = 1; i < paymentIds.length; i++) {
      console.log(`    - ${paymentIds[i]} (created ${formatDate(createdDates[i])}, $${amounts[i].toFixed(2)})`);
      paymentsToDelete.push(paymentIds[i]);
      totalAmountDuplicated += amounts[i];
    }

    totalDuplicates += deleteIds.length;
  }

  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`Duplicate payment records found: ${totalDuplicates}`);
  console.log(`Total duplicated amount: $${totalAmountDuplicated.toFixed(2)}`);
  console.log(`\nNote: This amount was recorded twice but only charged once in Stripe.`);

  if (paymentsToDelete.length === 0) {
    console.log('\nNo payments to delete.');
    await pool.end();
    return;
  }

  if (DRY_RUN) {
    console.log(`\n[DRY RUN] Would delete ${paymentsToDelete.length} duplicate payment record(s)`);
    console.log('\nRun without --dry-run to actually delete the duplicates.');
  } else {
    console.log(`\nDeleting ${paymentsToDelete.length} duplicate payment record(s)...`);

    // Delete duplicates
    await db
      .delete(orderPaymentTable)
      .where(inArray(orderPaymentTable.id, paymentsToDelete));

    console.log('✅ Duplicate payments deleted.');

    // Now fix the invoice paidAmount for affected orders
    console.log('\nRecalculating invoice paid amounts for affected orders...');

    // Get unique order IDs from the duplicates
    const affectedOrderIds = [...new Set(
      duplicates.rows.flatMap(row => row.order_ids as string[])
    )];

    for (const orderId of affectedOrderIds) {
      // Calculate correct paid amount from remaining payments
      const [paymentSum] = await db
        .select({
          totalPaid: sql<number>`COALESCE(SUM("amount"), 0)`.mapWith(Number),
        })
        .from(orderPaymentTable)
        .where(eq(orderPaymentTable.orderId, orderId));

      const correctPaidAmount = paymentSum?.totalPaid || 0;

      // Get order total for balance calculation
      const [order] = await db
        .select({ totalAmount: orderTable.totalAmount })
        .from(orderTable)
        .where(eq(orderTable.id, orderId));

      if (order) {
        const correctBalance = Math.max(0, order.totalAmount - correctPaidAmount);
        const invoiceStatus = correctBalance <= 0 ? 'paid' : 'sent';

        // Update invoice
        await db
          .update(orderInvoiceTable)
          .set({
            paidAmount: correctPaidAmount,
            balanceOwed: correctBalance,
            status: invoiceStatus,
            updatedAt: new Date(),
          })
          .where(eq(orderInvoiceTable.orderId, orderId));

        console.log(`  Updated invoice for order ${orderId}: paid=$${correctPaidAmount.toFixed(2)}, balance=$${correctBalance.toFixed(2)}`);
      }
    }

    console.log('\n✅ Invoice amounts recalculated.');

    // Output affected organizations for cache reference
    const orgResults = await db
      .select({
        organizationId: orderTable.organizationId,
        organizationName: organizationTable.name,
      })
      .from(orderTable)
      .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
      .where(inArray(orderTable.id, affectedOrderIds));

    const uniqueOrgs = [...new Map(orgResults.map(o => [o.organizationId, o])).values()];

    console.log('\n📋 Affected organizations (recent activity cache will refresh within 60 seconds):');
    uniqueOrgs.forEach(org => {
      console.log(`  - ${org.organizationName} (${org.organizationId})`);
    });
  }

  console.log('\nDone!');
  await pool.end();
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
