/**
 * Fix Duplicate Payments Script
 *
 * This script finds and removes duplicate records caused by a race condition
 * where both the confirm-payment route and the Stripe webhook could create
 * records for the same payment.
 *
 * It handles:
 * 1. Duplicate orderPayment records (same stripePaymentIntentId)
 * 2. Duplicate orderInvoice records (multiple invoices for same orderId)
 *
 * For duplicates, it keeps the first record created and removes the rest.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/reconciliation/fix-duplicate-payments.ts
 *
 * Options:
 *   --dry-run    Show what would be deleted without actually deleting
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, sql, inArray } from 'drizzle-orm';
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

// Helper to format dates
function formatDate(d: unknown): string {
  try {
    return d instanceof Date ? d.toISOString() : new Date(d as string).toISOString();
  } catch {
    return String(d);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Fix Duplicate Payments & Invoices Script');
  console.log('='.repeat(60));
  console.log(`DRY RUN: ${DRY_RUN ? 'YES (no changes will be made)' : 'NO (changes will be committed)'}`);
  console.log('='.repeat(60));

  const paymentsToDelete: string[] = [];
  const invoicesToDelete: string[] = [];
  const affectedOrderIds: Set<string> = new Set();

  // ============================================
  // 1. Find duplicate payment records
  // ============================================
  console.log('\n📋 STEP 1: Checking for duplicate payment records...');

  const duplicatePayments = await db.execute(sql`
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

  if (duplicatePayments.rows.length === 0) {
    console.log('✅ No duplicate payment records found.');
  } else {
    console.log(`Found ${duplicatePayments.rows.length} stripePaymentIntentId(s) with duplicate payments:\n`);

    for (const row of duplicatePayments.rows) {
      const paymentIntentId = row.stripePaymentIntentId as string;
      const paymentIds = row.payment_ids as string[];
      const orderIds = row.order_ids as string[];
      const amounts = row.amounts as number[];
      const createdDates = row.created_dates as Date[];

      // Track affected orders
      orderIds.forEach(id => affectedOrderIds.add(id));

      // Get order info
      const [orderInfo] = await db
        .select({
          orderNumber: orderTable.orderNumber,
          organizationName: organizationTable.name,
        })
        .from(orderTable)
        .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
        .where(eq(orderTable.id, orderIds[0]))
        .limit(1);

      console.log(`  Stripe PI: ${paymentIntentId}`);
      console.log(`    Company: ${orderInfo?.organizationName || 'Unknown'}`);
      console.log(`    Order: ${orderInfo?.orderNumber || orderIds[0]}`);
      console.log(`    Keeping: ${paymentIds[0]} (${formatDate(createdDates[0])})`);

      for (let i = 1; i < paymentIds.length; i++) {
        console.log(`    Deleting: ${paymentIds[i]} ($${amounts[i].toFixed(2)}, ${formatDate(createdDates[i])})`);
        paymentsToDelete.push(paymentIds[i]);
      }
    }
  }

  // ============================================
  // 2. Find duplicate invoice records
  // ============================================
  console.log('\n📋 STEP 2: Checking for duplicate invoice records...');

  const duplicateInvoices = await db.execute(sql`
    SELECT
      "orderId",
      COUNT(*) as count,
      array_agg("id" ORDER BY "createdAt" ASC) as invoice_ids,
      array_agg("invoiceNumber" ORDER BY "createdAt" ASC) as invoice_numbers,
      array_agg("totalAmount" ORDER BY "createdAt" ASC) as total_amounts,
      array_agg("status" ORDER BY "createdAt" ASC) as statuses,
      array_agg("createdAt" ORDER BY "createdAt" ASC) as created_dates
    FROM "orderInvoice"
    GROUP BY "orderId"
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC
  `);

  if (duplicateInvoices.rows.length === 0) {
    console.log('✅ No duplicate invoice records found.');
  } else {
    console.log(`Found ${duplicateInvoices.rows.length} order(s) with duplicate invoices:\n`);

    for (const row of duplicateInvoices.rows) {
      const orderId = row.orderId as string;
      const invoiceIds = row.invoice_ids as string[];
      const invoiceNumbers = row.invoice_numbers as string[];
      const totalAmounts = row.total_amounts as number[];
      const statuses = row.statuses as string[];
      const createdDates = row.created_dates as Date[];

      // Track affected orders
      affectedOrderIds.add(orderId);

      // Get order info
      const [orderInfo] = await db
        .select({
          orderNumber: orderTable.orderNumber,
          organizationName: organizationTable.name,
        })
        .from(orderTable)
        .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
        .where(eq(orderTable.id, orderId))
        .limit(1);

      console.log(`  Order: ${orderInfo?.orderNumber || orderId}`);
      console.log(`    Company: ${orderInfo?.organizationName || 'Unknown'}`);
      console.log(`    Invoice count: ${invoiceIds.length} (should be 1)`);
      console.log(`    Keeping: ${invoiceNumbers[0]} (${statuses[0]}, ${formatDate(createdDates[0])})`);

      for (let i = 1; i < invoiceIds.length; i++) {
        console.log(`    Deleting: ${invoiceNumbers[i]} ($${totalAmounts[i].toFixed(2)}, ${statuses[i]}, ${formatDate(createdDates[i])})`);
        invoicesToDelete.push(invoiceIds[i]);
      }
    }
  }

  // ============================================
  // 3. Summary
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`Duplicate payment records to delete: ${paymentsToDelete.length}`);
  console.log(`Duplicate invoice records to delete: ${invoicesToDelete.length}`);
  console.log(`Affected orders: ${affectedOrderIds.size}`);

  if (paymentsToDelete.length === 0 && invoicesToDelete.length === 0) {
    console.log('\n✅ No duplicates found. All good!');
    await pool.end();
    return;
  }

  // ============================================
  // 4. Execute deletions
  // ============================================
  if (DRY_RUN) {
    console.log('\n[DRY RUN] No changes made. Run without --dry-run to delete duplicates.');
  } else {
    console.log('\n🔧 Executing deletions...');

    // Delete duplicate payments
    if (paymentsToDelete.length > 0) {
      await db
        .delete(orderPaymentTable)
        .where(inArray(orderPaymentTable.id, paymentsToDelete));
      console.log(`✅ Deleted ${paymentsToDelete.length} duplicate payment record(s)`);
    }

    // Delete duplicate invoices
    if (invoicesToDelete.length > 0) {
      await db
        .delete(orderInvoiceTable)
        .where(inArray(orderInvoiceTable.id, invoicesToDelete));
      console.log(`✅ Deleted ${invoicesToDelete.length} duplicate invoice record(s)`);
    }

    // ============================================
    // 5. Recalculate remaining invoice amounts
    // ============================================
    console.log('\n🔧 Recalculating invoice amounts for affected orders...');

    const orderIdArray = Array.from(affectedOrderIds);

    for (const orderId of orderIdArray) {
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
        .select({
          orderNumber: orderTable.orderNumber,
          totalAmount: orderTable.totalAmount,
        })
        .from(orderTable)
        .where(eq(orderTable.id, orderId));

      if (order) {
        const correctBalance = Math.max(0, order.totalAmount - correctPaidAmount);
        const invoiceStatus = correctBalance <= 0 ? 'paid' : 'sent';

        // Update remaining invoice (there should only be one now)
        await db
          .update(orderInvoiceTable)
          .set({
            paidAmount: correctPaidAmount,
            balanceOwed: correctBalance,
            status: invoiceStatus,
            updatedAt: new Date(),
          })
          .where(eq(orderInvoiceTable.orderId, orderId));

        console.log(`  Order ${order.orderNumber}: paid=$${correctPaidAmount.toFixed(2)}, balance=$${correctBalance.toFixed(2)}, status=${invoiceStatus}`);
      }
    }

    console.log('\n✅ Invoice amounts recalculated.');

    // Output affected organizations
    if (orderIdArray.length > 0) {
      const orgResults = await db
        .select({
          organizationId: orderTable.organizationId,
          organizationName: organizationTable.name,
        })
        .from(orderTable)
        .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
        .where(inArray(orderTable.id, orderIdArray));

      // Deduplicate by organization ID
      const seenOrgIds = new Set<string>();
      console.log('\n📋 Affected organizations:');
      for (const org of orgResults) {
        if (!seenOrgIds.has(org.organizationId)) {
          seenOrgIds.add(org.organizationId);
          console.log(`  - ${org.organizationName} (${org.organizationId})`);
        }
      }
    }
  }

  console.log('\nDone!');
  await pool.end();
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
