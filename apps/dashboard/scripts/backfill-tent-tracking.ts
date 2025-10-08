#!/usr/bin/env tsx

/**
 * Backfill script to populate tentPurchaseTrackingTable with existing tent orders
 *
 * This script finds all completed tent orders and creates tracking records for them.
 * Run this once to populate the tracking table with historical data.
 */

import { db, sql, eq, and } from '@workspace/database/client';
import {
  orderTable,
  orderItemTable,
  productTable,
  tentPurchaseTrackingTable,
  OrderStatus,
  ProductType
} from '@workspace/database/schema';

interface TentOrder {
  orderId: string;
  organizationId: string;
  eventYearId: string;
  productId: string;
  productName: string;
  quantity: number;
  maxQuantityPerOrg: number;
  orderCreatedAt: Date;
}

async function backfillTentTracking() {
  console.log('🔄 Starting tent tracking backfill...');

  try {
    // Find all completed tent orders
    const tentOrders = await db
      .select({
        orderId: orderTable.id,
        organizationId: orderTable.organizationId,
        eventYearId: orderTable.eventYearId,
        productId: productTable.id,
        productName: productTable.name,
        quantity: orderItemTable.quantity,
        maxQuantityPerOrg: productTable.maxQuantityPerOrg,
        orderCreatedAt: orderTable.createdAt
      })
      .from(orderTable)
      .innerJoin(orderItemTable, eq(orderTable.id, orderItemTable.orderId))
      .innerJoin(productTable, eq(orderItemTable.productId, productTable.id))
      .where(
        and(
          eq(productTable.type, ProductType.TENT_RENTAL),
          sql`${orderTable.status} IN ('fully_paid', 'deposit_paid')`
        )
      )
      .orderBy(orderTable.createdAt);

    console.log(`📊 Found ${tentOrders.length} tent orders to process`);

    if (tentOrders.length === 0) {
      console.log('✅ No tent orders found. Nothing to backfill.');
      return;
    }

    // Group orders by organization, event year, and product
    const organizationTentPurchases = new Map<string, {
      organizationId: string;
      eventYearId: string;
      tentProductId: string;
      maxAllowed: number;
      totalQuantity: number;
      orders: TentOrder[];
    }>();

    for (const order of tentOrders) {
      const key = `${order.organizationId}-${order.eventYearId}-${order.productId}`;

      if (!organizationTentPurchases.has(key)) {
        organizationTentPurchases.set(key, {
          organizationId: order.organizationId,
          eventYearId: order.eventYearId,
          tentProductId: order.productId,
          maxAllowed: order.maxQuantityPerOrg || 0,
          totalQuantity: 0,
          orders: []
        });
      }

      const entry = organizationTentPurchases.get(key)!;
      entry.totalQuantity += order.quantity;
      entry.orders.push(order);
    }

    console.log(`🏢 Processing ${organizationTentPurchases.size} organization-product combinations`);

    // Check for existing tracking records to avoid duplicates
    const existingRecords = await db
      .select({
        organizationId: tentPurchaseTrackingTable.organizationId,
        eventYearId: tentPurchaseTrackingTable.eventYearId,
        tentProductId: tentPurchaseTrackingTable.tentProductId
      })
      .from(tentPurchaseTrackingTable);

    const existingKeys = new Set(
      existingRecords.map(r => `${r.organizationId}-${r.eventYearId}-${r.tentProductId}`)
    );

    // Create tracking records for organizations that don't already have them
    const recordsToCreate = [];
    let skippedCount = 0;

    for (const [key, data] of organizationTentPurchases) {
      if (existingKeys.has(key)) {
        console.log(`⏭️  Skipping existing record for key: ${key}`);
        skippedCount++;
        continue;
      }

      const remainingAllowed = Math.max(0, data.maxAllowed - data.totalQuantity);

      recordsToCreate.push({
        organizationId: data.organizationId,
        eventYearId: data.eventYearId,
        tentProductId: data.tentProductId,
        quantityPurchased: data.totalQuantity,
        maxAllowed: data.maxAllowed,
        remainingAllowed: remainingAllowed,
        // Use the earliest order date as the created date
        createdAt: data.orders.sort((a, b) => a.orderCreatedAt.getTime() - b.orderCreatedAt.getTime())[0].orderCreatedAt
      });

      console.log(`📝 Will create tracking record:`, {
        organizationId: data.organizationId,
        eventYearId: data.eventYearId,
        tentProductId: data.tentProductId,
        quantityPurchased: data.totalQuantity,
        maxAllowed: data.maxAllowed,
        remainingAllowed: remainingAllowed,
        orders: data.orders.length
      });
    }

    if (recordsToCreate.length === 0) {
      console.log(`✅ All tent tracking records already exist. Skipped ${skippedCount} records.`);
      return;
    }

    // Insert the tracking records
    await db.insert(tentPurchaseTrackingTable).values(recordsToCreate);

    console.log(`✅ Successfully created ${recordsToCreate.length} tent tracking records!`);
    console.log(`⏭️  Skipped ${skippedCount} existing records`);

    // Show summary
    console.log('\n📋 Summary of created records:');
    for (const record of recordsToCreate) {
      const orgData = organizationTentPurchases.get(
        `${record.organizationId}-${record.eventYearId}-${record.tentProductId}`
      );

      console.log(`  🏢 Org: ${record.organizationId}`);
      console.log(`     📅 Event Year: ${record.eventYearId}`);
      console.log(`     🏕️  Tents Purchased: ${record.quantityPurchased}/${record.maxAllowed}`);
      console.log(`     📊 Remaining: ${record.remainingAllowed}`);
      console.log(`     📦 Orders: ${orgData?.orders.length || 0}`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error during tent tracking backfill:', error);
    throw error;
  }
}

// Check for existing tracking data first
async function checkExistingData() {
  console.log('🔍 Checking existing tent tracking data...');

  const existingCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tentPurchaseTrackingTable)
    .then(result => Number(result[0]?.count || 0));

  console.log(`📊 Found ${existingCount} existing tent tracking records`);

  if (existingCount > 0) {
    console.log('⚠️  Existing tent tracking data found. Script will skip duplicates.');
  }

  return existingCount;
}

// Main execution
async function main() {
  console.log('🏕️  Tent Tracking Backfill Script');
  console.log('=====================================\n');

  try {
    await checkExistingData();
    await backfillTentTracking();

    console.log('\n✅ Tent tracking backfill completed successfully!');
    console.log('🎯 Your tent purchase data should now show correctly in the admin dashboard.');

  } catch (error) {
    console.error('\n❌ Backfill failed:', error);
    process.exit(1);
  }
}

// Run the script automatically when imported
main();

export { backfillTentTracking };