#!/usr/bin/env tsx

/**
 * Simple backfill script to populate tentPurchaseTrackingTable with existing tent orders
 * This version uses a simpler approach that works around module import issues
 */

import { sql } from '@workspace/database/client';

async function backfillTentTracking() {
  console.log('🔄 Starting tent tracking backfill...');

  try {
    // Check existing tent tracking data
    const existingCountResult = await sql`
      SELECT COUNT(*) as count FROM "tentPurchaseTracking"
    `;
    const existingCount = Number(existingCountResult[0]?.count || 0);
    console.log(`📊 Found ${existingCount} existing tent tracking records`);

    // Find all completed tent orders that don't have tracking records
    const tentOrdersQuery = sql`
      SELECT
        o."organizationId",
        o."eventYearId",
        p.id as "productId",
        p.name as "productName",
        p."maxQuantityPerOrg",
        SUM(oi.quantity) as "totalQuantity",
        MIN(o."createdAt") as "earliestOrder"
      FROM "order" o
      INNER JOIN "orderItem" oi ON o.id = oi."orderId"
      INNER JOIN product p ON oi."productId" = p.id
      WHERE p.type = 'tent_rental'
        AND o.status IN ('fully_paid', 'deposit_paid')
        AND NOT EXISTS (
          SELECT 1 FROM "tentPurchaseTracking" tpt
          WHERE tpt."organizationId" = o."organizationId"
            AND tpt."eventYearId" = o."eventYearId"
            AND tpt."tentProductId" = p.id
        )
      GROUP BY o."organizationId", o."eventYearId", p.id, p.name, p."maxQuantityPerOrg"
      ORDER BY "earliestOrder"
    `;

    const tentOrders = await tentOrdersQuery;
    console.log(`📊 Found ${tentOrders.length} tent purchase groups to process`);

    if (tentOrders.length === 0) {
      console.log('✅ No new tent orders to backfill. All tracking records already exist.');
      return;
    }

    // Insert tracking records
    let createdCount = 0;
    for (const order of tentOrders) {
      const maxAllowed = Number(order.maxQuantityPerOrg || 0);
      const totalQuantity = Number(order.totalQuantity);
      const remainingAllowed = Math.max(0, maxAllowed - totalQuantity);

      console.log(`📝 Creating tracking record:`, {
        organizationId: order.organizationId,
        eventYearId: order.eventYearId,
        productId: order.productId,
        productName: order.productName,
        totalQuantity,
        maxAllowed,
        remainingAllowed
      });

      await sql`
        INSERT INTO "tentPurchaseTracking" (
          "organizationId",
          "eventYearId",
          "tentProductId",
          "quantityPurchased",
          "maxAllowed",
          "remainingAllowed",
          "createdAt",
          "updatedAt"
        ) VALUES (
          ${order.organizationId},
          ${order.eventYearId},
          ${order.productId},
          ${totalQuantity},
          ${maxAllowed},
          ${remainingAllowed},
          ${order.earliestOrder},
          NOW()
        )
      `;

      createdCount++;
    }

    console.log(`✅ Successfully created ${createdCount} tent tracking records!`);

    // Show final summary
    const finalCountResult = await sql`
      SELECT COUNT(*) as count FROM "tentPurchaseTracking"
    `;
    const finalCount = Number(finalCountResult[0]?.count || 0);

    console.log(`\n📋 Final Summary:`);
    console.log(`  🆕 Created: ${createdCount} new records`);
    console.log(`  📊 Total tracking records: ${finalCount}`);
    console.log(`\n🎯 Your tent tracking should now show correct data in the admin dashboard!`);

  } catch (error) {
    console.error('❌ Error during tent tracking backfill:', error);
    throw error;
  }
}

// Main execution
async function main() {
  console.log('🏕️  Tent Tracking Backfill Script (Simple Version)');
  console.log('================================================\n');

  try {
    await backfillTentTracking();
    console.log('\n✅ Tent tracking backfill completed successfully!');
  } catch (error) {
    console.error('\n❌ Backfill failed:', error);
    process.exit(1);
  }
}

// Run the script
main();