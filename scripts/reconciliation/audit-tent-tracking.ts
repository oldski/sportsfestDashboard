/**
 * Audit Tent Purchase Tracking Script
 *
 * Compares each organization's tent tracking record (quantityPurchased) against
 * the actual tent quantities in their completed order items. Reports mismatches
 * caused by the confirm-payment / webhook race condition double-calling
 * confirmTentSale().
 *
 * Also audits the product-level soldCount for tent products.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/reconciliation/audit-tent-tracking.ts
 *
 * Options:
 *   --fix    Correct mismatched tent tracking records and product soldCount
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, and, sql } from 'drizzle-orm';
import {
  tentPurchaseTrackingTable,
  orderTable,
  orderItemTable,
  orderPaymentTable,
  productTable,
  organizationTable,
  eventYearTable,
  ProductType,
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
  console.error('Usage: DATABASE_URL="postgresql://..." npx tsx scripts/reconciliation/audit-tent-tracking.ts');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

// ============================================
// Main Function
// ============================================

async function main() {
  console.log('='.repeat(70));
  console.log('Audit Tent Purchase Tracking');
  console.log('='.repeat(70));
  console.log(`MODE: ${FIX_MODE ? 'FIX (will correct mismatched records)' : 'AUDIT ONLY (read-only, use --fix to correct)'}`);
  console.log('='.repeat(70));

  // ============================================
  // 1. Audit per-org tent tracking records
  // ============================================
  console.log('\n📋 STEP 1: Checking tent tracking records against actual order items...\n');

  // Get all tent tracking records with org/event info
  const trackingRecords = await db
    .select({
      id: tentPurchaseTrackingTable.id,
      organizationId: tentPurchaseTrackingTable.organizationId,
      eventYearId: tentPurchaseTrackingTable.eventYearId,
      tentProductId: tentPurchaseTrackingTable.tentProductId,
      quantityPurchased: tentPurchaseTrackingTable.quantityPurchased,
      maxAllowed: tentPurchaseTrackingTable.maxAllowed,
      remainingAllowed: tentPurchaseTrackingTable.remainingAllowed,
      companyTeamCount: tentPurchaseTrackingTable.companyTeamCount,
      organizationName: organizationTable.name,
      eventYearName: eventYearTable.name,
      productName: productTable.name,
    })
    .from(tentPurchaseTrackingTable)
    .innerJoin(organizationTable, eq(tentPurchaseTrackingTable.organizationId, organizationTable.id))
    .innerJoin(eventYearTable, eq(tentPurchaseTrackingTable.eventYearId, eventYearTable.id))
    .innerJoin(productTable, eq(tentPurchaseTrackingTable.tentProductId, productTable.id));

  if (trackingRecords.length === 0) {
    console.log('No tent tracking records found.');
    await pool.end();
    return;
  }

  console.log(`Found ${trackingRecords.length} tent tracking record(s).\n`);

  type Mismatch = typeof trackingRecords[0] & { actualQuantity: number };
  const mismatched: Mismatch[] = [];
  let matchedCount = 0;

  for (const record of trackingRecords) {
    // Calculate actual tent quantity from completed order items
    // Only count orders that have at least one completed payment
    const result = await db.execute(sql`
      SELECT COALESCE(SUM(oi."quantity"), 0) AS actual_quantity
      FROM "orderItem" oi
      INNER JOIN "order" o ON o."id" = oi."orderId"
      WHERE oi."productId" = ${record.tentProductId}
        AND o."organizationId" = ${record.organizationId}
        AND o."eventYearId" = ${record.eventYearId}
        AND EXISTS (
          SELECT 1 FROM "orderPayment" op
          WHERE op."orderId" = o."id"
            AND op."status" = 'completed'
        )
    `);

    const actualQuantity = Number((result.rows[0] as any)?.actual_quantity || 0);

    if (actualQuantity !== record.quantityPurchased) {
      mismatched.push({ ...record, actualQuantity });
    } else {
      matchedCount++;
    }
  }

  console.log('-'.repeat(70));
  console.log(`Correct records:    ${matchedCount}`);
  console.log(`Mismatched records: ${mismatched.length}`);
  console.log('-'.repeat(70));

  if (mismatched.length > 0) {
    console.log('\nMismatched tent tracking records:\n');

    for (const m of mismatched) {
      const diff = m.quantityPurchased - m.actualQuantity;
      const correctMax = m.companyTeamCount * 2;
      const correctRemaining = Math.max(0, correctMax - m.actualQuantity);

      console.log(`  ${m.organizationName}`);
      console.log(`    Event Year:          ${m.eventYearName}`);
      console.log(`    Product:             ${m.productName}`);
      console.log(`    Stored Purchased:    ${m.quantityPurchased}  ← incorrect`);
      console.log(`    Actual Purchased:    ${m.actualQuantity}  ← from order items`);
      console.log(`    Over-counted by:     ${diff}`);
      console.log(`    Company Teams:       ${m.companyTeamCount}`);
      console.log(`    Max Allowed:         ${correctMax} (${m.companyTeamCount} teams × 2)`);
      console.log(`    Stored Remaining:    ${m.remainingAllowed}`);
      console.log(`    Correct Remaining:   ${correctRemaining}`);
      console.log('');
    }
  }

  // ============================================
  // 2. Audit product-level soldCount for tent products
  // ============================================
  console.log('\n📋 STEP 2: Checking tent product soldCount against actual order items...\n');

  const tentProducts = await db
    .select({
      id: productTable.id,
      name: productTable.name,
      soldCount: productTable.soldCount,
      reservedCount: productTable.reservedCount,
      totalInventory: productTable.totalInventory,
    })
    .from(productTable)
    .where(eq(productTable.type, ProductType.TENT_RENTAL));

  type ProductMismatch = typeof tentProducts[0] & { actualSold: number };
  const productMismatches: ProductMismatch[] = [];

  for (const product of tentProducts) {
    // Sum actual tent quantities from orders with completed payments
    const result = await db.execute(sql`
      SELECT COALESCE(SUM(oi."quantity"), 0) AS actual_sold
      FROM "orderItem" oi
      INNER JOIN "order" o ON o."id" = oi."orderId"
      WHERE oi."productId" = ${product.id}
        AND EXISTS (
          SELECT 1 FROM "orderPayment" op
          WHERE op."orderId" = o."id"
            AND op."status" = 'completed'
        )
    `);

    const actualSold = Number((result.rows[0] as any)?.actual_sold || 0);

    if (actualSold !== Number(product.soldCount)) {
      productMismatches.push({ ...product, actualSold });
      console.log(`  ${product.name}`);
      console.log(`    Stored soldCount:  ${product.soldCount}  ← incorrect`);
      console.log(`    Actual sold:       ${actualSold}  ← from order items`);
      console.log(`    Over-counted by:   ${Number(product.soldCount) - actualSold}`);
      console.log('');
    }
  }

  if (productMismatches.length === 0) {
    console.log('  ✅ All tent product soldCounts are correct.');
  }

  // ============================================
  // 3. Summary
  // ============================================

  console.log('\n' + '='.repeat(70));
  console.log('Summary');
  console.log('='.repeat(70));
  console.log(`Tent tracking mismatches:  ${mismatched.length}`);
  console.log(`Product soldCount mismatches: ${productMismatches.length}`);

  if (mismatched.length === 0 && productMismatches.length === 0) {
    console.log('\n✅ Everything looks correct. No action needed.');
    await pool.end();
    return;
  }

  // ============================================
  // 4. Fix (optional)
  // ============================================

  if (!FIX_MODE) {
    console.log('\nRun with --fix to correct the values.');
  } else {
    console.log('\n🔧 Correcting values...\n');

    // Fix tent tracking records
    for (const m of mismatched) {
      const correctMax = m.companyTeamCount * 2;
      const correctRemaining = Math.max(0, correctMax - m.actualQuantity);

      await db
        .update(tentPurchaseTrackingTable)
        .set({
          quantityPurchased: m.actualQuantity,
          remainingAllowed: correctRemaining,
          updatedAt: new Date(),
        })
        .where(eq(tentPurchaseTrackingTable.id, m.id));

      console.log(`  ✅ ${m.organizationName}: quantityPurchased=${m.actualQuantity}, remainingAllowed=${correctRemaining}`);
    }

    // Fix product soldCounts
    for (const p of productMismatches) {
      await db.execute(sql`
        UPDATE product
        SET soldcount = ${p.actualSold}
        WHERE id = ${p.id}
      `);

      console.log(`  ✅ ${p.name}: soldCount=${p.actualSold}`);
    }

    console.log(`\n✅ Corrected ${mismatched.length} tracking record(s) and ${productMismatches.length} product(s).`);
  }

  console.log('\nDone!');
  await pool.end();
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
