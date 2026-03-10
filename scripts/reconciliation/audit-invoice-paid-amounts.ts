/**
 * Audit Invoice Paid Amounts Script
 *
 * Compares each invoice's stored paidAmount against the actual sum of completed
 * orderPayment records for the same order. Reports any mismatches caused by the
 * confirm-payment / webhook race condition that double-incremented paidAmount.
 *
 * The read-layer code fix (deriving paidAmount from payments) means the UI already
 * shows correct values, but this script lets you verify the scope of the issue
 * and optionally correct the stored values for consistency.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/reconciliation/audit-invoice-paid-amounts.ts
 *
 * Options:
 *   --fix    Correct the stored paidAmount/balanceOwed/status on mismatched invoices
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, sql } from 'drizzle-orm';
import {
  orderInvoiceTable,
  orderTable,
  orderPaymentTable,
  organizationTable,
  eventYearTable,
} from '../../packages/database/src/schema';

// ============================================
// Configuration
// ============================================

const FIX_MODE = process.argv.includes('--fix');

// ============================================
// Database Connection
// ============================================

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  console.error('Usage: DATABASE_URL="postgresql://..." npx tsx scripts/reconciliation/audit-invoice-paid-amounts.ts');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

// ============================================
// Main Function
// ============================================

async function main() {
  console.log('='.repeat(70));
  console.log('Audit Invoice Paid Amounts');
  console.log('='.repeat(70));
  console.log(`MODE: ${FIX_MODE ? 'FIX (will correct mismatched invoices)' : 'AUDIT ONLY (read-only, use --fix to correct)'}`);
  console.log('='.repeat(70));

  // Find all invoices alongside the actual sum of completed payments for that order
  const results = await db.execute(sql`
    SELECT
      i."id"              AS invoice_id,
      i."invoiceNumber"   AS invoice_number,
      i."orderId"         AS order_id,
      i."totalAmount"     AS invoice_total,
      i."paidAmount"      AS stored_paid,
      i."balanceOwed"     AS stored_balance,
      i."status"          AS stored_status,
      o."orderNumber"     AS order_number,
      o."totalAmount"     AS order_total,
      o."status"          AS order_status,
      org."name"          AS organization_name,
      org."slug"          AS organization_slug,
      ey."name"           AS event_year_name,
      COALESCE(p.actual_paid, 0) AS actual_paid
    FROM "orderInvoice" i
    INNER JOIN "order" o        ON o."id" = i."orderId"
    INNER JOIN "organization" org ON org."id" = o."organizationId"
    LEFT  JOIN "eventYear" ey   ON ey."id" = o."eventYearId"
    LEFT  JOIN (
      SELECT
        "orderId",
        SUM("amount") AS actual_paid
      FROM "orderPayment"
      WHERE "status" = 'completed'
      GROUP BY "orderId"
    ) p ON p."orderId" = i."orderId"
    ORDER BY org."name", o."orderNumber"
  `);

  type Row = {
    invoice_id: string;
    invoice_number: string;
    order_id: string;
    invoice_total: number;
    stored_paid: number;
    stored_balance: number;
    stored_status: string;
    order_number: string;
    order_total: number;
    order_status: string;
    organization_name: string;
    organization_slug: string;
    event_year_name: string | null;
    actual_paid: number;
  };

  const rows = results.rows as Row[];

  console.log(`\nTotal invoices checked: ${rows.length}\n`);

  // Separate matched vs mismatched
  const mismatched: (Row & { expected_balance: number })[] = [];
  let matchedCount = 0;

  for (const row of rows) {
    const actualPaid = Number(row.actual_paid);
    const storedPaid = Number(row.stored_paid);
    const expectedBalance = Math.max(0, Number(row.invoice_total) - actualPaid);

    // Use a small epsilon for floating point comparison
    if (Math.abs(actualPaid - storedPaid) > 0.005) {
      mismatched.push({ ...row, actual_paid: actualPaid, stored_paid: storedPaid, expected_balance: expectedBalance });
    } else {
      matchedCount++;
    }
  }

  // ============================================
  // Report
  // ============================================

  console.log('-'.repeat(70));
  console.log(`Invoices with CORRECT stored paidAmount: ${matchedCount}`);
  console.log(`Invoices with MISMATCHED paidAmount:     ${mismatched.length}`);
  console.log('-'.repeat(70));

  if (mismatched.length === 0) {
    console.log('\n✅ All invoices have correct stored paidAmount values. No action needed.');
    await pool.end();
    return;
  }

  // Group by organization for readability
  const byOrg = new Map<string, typeof mismatched>();
  for (const row of mismatched) {
    const key = row.organization_name;
    if (!byOrg.has(key)) byOrg.set(key, []);
    byOrg.get(key)!.push(row);
  }

  let totalOvercount = 0;

  console.log(`\nAffected organizations: ${byOrg.size}\n`);

  for (const [orgName, invoices] of byOrg) {
    console.log(`\n  ${orgName}`);
    console.log('  ' + '-'.repeat(60));

    for (const inv of invoices) {
      const diff = inv.stored_paid - inv.actual_paid;
      totalOvercount += diff;

      console.log(`    Invoice: ${inv.invoice_number}  |  Order: ${inv.order_number}`);
      console.log(`      Event Year:      ${inv.event_year_name || 'N/A'}`);
      console.log(`      Invoice Total:   $${Number(inv.invoice_total).toFixed(2)}`);
      console.log(`      Stored Paid:     $${inv.stored_paid.toFixed(2)}  ← incorrect`);
      console.log(`      Actual Paid:     $${inv.actual_paid.toFixed(2)}  ← from payment records`);
      console.log(`      Difference:      $${diff.toFixed(2)} over-counted`);
      console.log(`      Stored Balance:  $${Number(inv.stored_balance).toFixed(2)}`);
      console.log(`      Correct Balance: $${inv.expected_balance.toFixed(2)}`);
      console.log(`      Order Status:    ${inv.order_status}`);
      console.log('');
    }
  }

  // ============================================
  // Summary
  // ============================================

  console.log('='.repeat(70));
  console.log('Summary');
  console.log('='.repeat(70));
  console.log(`Mismatched invoices:     ${mismatched.length}`);
  console.log(`Affected organizations:  ${byOrg.size}`);
  console.log(`Total over-counted:      $${totalOvercount.toFixed(2)}`);

  // ============================================
  // Fix (optional)
  // ============================================

  if (!FIX_MODE) {
    console.log('\nRun with --fix to correct the stored values.');
    console.log('Note: The UI already shows correct values via the read-layer fix.');
  } else {
    console.log('\n🔧 Correcting stored invoice values...\n');

    for (const inv of mismatched) {
      const correctPaid = inv.actual_paid;
      const correctBalance = inv.expected_balance;
      let correctStatus = inv.stored_status;

      // Recalculate status
      if (inv.stored_status !== 'cancelled' && inv.stored_status !== 'draft') {
        if (correctBalance <= 0) {
          correctStatus = 'paid';
        } else if (correctPaid > 0) {
          correctStatus = 'partial';
        } else {
          correctStatus = 'sent';
        }
      }

      await db
        .update(orderInvoiceTable)
        .set({
          paidAmount: correctPaid,
          balanceOwed: correctBalance,
          status: correctStatus,
          updatedAt: new Date(),
        })
        .where(eq(orderInvoiceTable.id, inv.invoice_id));

      console.log(`  ✅ ${inv.invoice_number}: paid=$${correctPaid.toFixed(2)}, balance=$${correctBalance.toFixed(2)}, status=${correctStatus}`);
    }

    console.log(`\n✅ Corrected ${mismatched.length} invoice(s).`);
  }

  console.log('\nDone!');
  await pool.end();
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
