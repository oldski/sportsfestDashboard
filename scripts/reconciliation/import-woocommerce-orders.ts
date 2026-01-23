/**
 * WooCommerce Order Import Script
 *
 * This script imports orders from a CSV file into the SportsFest dashboard database.
 * It creates order, orderItem, and orderPayment records.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/reconciliation/import-woocommerce-orders.ts [csv-file-path]
 *
 * Example:
 *   DATABASE_URL="postgresql://postgres.xxx:password@aws-1-us-east-1.pooler.37se.com:6543/postgres" \
 *     npx tsx scripts/reconciliation/import-woocommerce-orders.ts scripts/reconciliation/import-orders.csv
 *
 * CSV Format:
 *   orderDate,customerEmail,organizationId,status,teamQuantity,tentQuantity,amountPaid,paymentDate,stripePaymentId,notes
 */

import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, sql, and, desc } from 'drizzle-orm';
import {
  orderTable,
  orderItemTable,
  orderPaymentTable,
  orderInvoiceTable,
  productTable,
  organizationTable,
  companyTeamTable,
  OrderStatus,
  PaymentStatus,
  PaymentType,
} from '../../packages/database/src/schema';

// ============================================
// CONFIGURATION - Update these as needed
// ============================================

// Event Year ID for 2026 (Corporate SportsFest 2026)
const EVENT_YEAR_ID = 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e';

// Product IDs (from dev database)
const TEAM_PRODUCT_ID = 'aef21fa6-15d1-46ea-ace7-bafe7a8099a2';
const TENT_PRODUCT_ID = 'd7566b5c-b02c-47e4-924b-7094dd9c1981';

// Product prices
const TEAM_PRICE = 1450;
const TENT_PRICE = 100;

// Deposit amount for team registration
const TEAM_DEPOSIT = 300;

// Dry run mode - pass --dry-run flag to preview without making changes
const DRY_RUN = process.argv.includes('--dry-run');

// ============================================
// Types
// ============================================

interface CsvRow {
  orderDate: string;
  customerEmail: string;
  organizationId: string;
  status: string;
  teamQuantity: string;
  tentQuantity: string;
  amountPaid: string;
  paymentDate: string;
  stripePaymentId: string;
  notes: string;
}

interface ProcessedOrder {
  orderDate: Date;
  customerEmail: string;
  organizationId: string;
  status: OrderStatus;
  teamQuantity: number;
  tentQuantity: number;
  amountPaid: number;
  paymentDate: Date | null;
  stripePaymentId: string | null;
  notes: string | null;
  totalAmount: number;
  depositAmount: number;
  balanceOwed: number;
}

// ============================================
// Database Connection
// ============================================

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  console.error('Usage: DATABASE_URL="postgresql://..." npx tsx scripts/import-woocommerce-orders.ts [csv-file]');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

// ============================================
// Helper Functions
// ============================================

/**
 * Generate order number based on year
 * Format: ORD-YYYY-XXXX (e.g., ORD-2025-0001)
 */
async function generateOrderNumber(year: number): Promise<string> {
  // Find the highest order number for this year
  const result = await db
    .select({ orderNumber: orderTable.orderNumber })
    .from(orderTable)
    .where(sql`${orderTable.orderNumber} LIKE ${'ORD-' + year + '-%'}`)
    .orderBy(desc(orderTable.orderNumber))
    .limit(1);

  let nextNumber = 1;

  if (result.length > 0) {
    const lastNumber = result[0].orderNumber;
    const match = lastNumber.match(/ORD-\d{4}-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `ORD-${year}-${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Generate invoice number based on year
 * Format: INV-YYYY-XXXX (e.g., INV-2025-0001)
 */
async function generateInvoiceNumber(year: number): Promise<string> {
  const result = await db
    .select({ invoiceNumber: orderInvoiceTable.invoiceNumber })
    .from(orderInvoiceTable)
    .where(sql`${orderInvoiceTable.invoiceNumber} LIKE ${'INV-' + year + '-%'}`)
    .orderBy(desc(orderInvoiceTable.invoiceNumber))
    .limit(1);

  let nextNumber = 1;

  if (result.length > 0) {
    const lastNumber = result[0].invoiceNumber;
    const match = lastNumber.match(/INV-\d{4}-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `INV-${year}-${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Map CSV status to OrderStatus enum
 */
function mapStatus(status: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    'pending': OrderStatus.PENDING,
    'payment_processing': OrderStatus.PAYMENT_PROCESSING,
    'confirmed': OrderStatus.CONFIRMED,
    'deposit_paid': OrderStatus.DEPOSIT_PAID,
    'fully_paid': OrderStatus.FULLY_PAID,
    'cancelled': OrderStatus.CANCELLED,
    'refunded': OrderStatus.REFUNDED,
  };

  const mapped = statusMap[status.toLowerCase()];
  if (!mapped) {
    throw new Error(`Invalid status: ${status}. Valid values: ${Object.keys(statusMap).join(', ')}`);
  }
  return mapped;
}

/**
 * Parse and validate a CSV row
 */
function parseRow(row: CsvRow, rowIndex: number): ProcessedOrder {
  const errors: string[] = [];

  // Parse quantities
  const teamQuantity = parseInt(row.teamQuantity, 10) || 0;
  const tentQuantity = parseInt(row.tentQuantity, 10) || 0;

  if (teamQuantity < 0) errors.push('teamQuantity must be >= 0');
  if (tentQuantity < 0) errors.push('tentQuantity must be >= 0');
  if (teamQuantity === 0 && tentQuantity === 0) errors.push('At least one product quantity must be > 0');

  // Parse amount
  const amountPaid = parseFloat(row.amountPaid) || 0;
  if (amountPaid < 0) errors.push('amountPaid must be >= 0');

  // Validate organizationId format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(row.organizationId)) {
    errors.push(`Invalid organizationId UUID: ${row.organizationId}`);
  }

  // Parse dates
  const orderDate = new Date(row.orderDate);
  if (isNaN(orderDate.getTime())) {
    errors.push(`Invalid orderDate: ${row.orderDate}`);
  }

  let paymentDate: Date | null = null;
  if (row.paymentDate && row.paymentDate.trim()) {
    paymentDate = new Date(row.paymentDate);
    if (isNaN(paymentDate.getTime())) {
      errors.push(`Invalid paymentDate: ${row.paymentDate}`);
    }
  }

  // Validate status
  let status: OrderStatus;
  try {
    status = mapStatus(row.status);
  } catch (e) {
    errors.push((e as Error).message);
    status = OrderStatus.PENDING;
  }

  if (errors.length > 0) {
    throw new Error(`Row ${rowIndex + 2}: ${errors.join('; ')}`);
  }

  // Calculate totals
  const totalAmount = (teamQuantity * TEAM_PRICE) + (tentQuantity * TENT_PRICE);
  const depositAmount = teamQuantity * TEAM_DEPOSIT; // Only teams require deposits
  const balanceOwed = totalAmount - amountPaid;

  return {
    orderDate,
    customerEmail: row.customerEmail.trim(),
    organizationId: row.organizationId.trim(),
    status,
    teamQuantity,
    tentQuantity,
    amountPaid,
    paymentDate,
    stripePaymentId: row.stripePaymentId?.trim() || null,
    notes: row.notes?.trim() || null,
    totalAmount,
    depositAmount,
    balanceOwed,
  };
}

/**
 * Validate that organization exists
 */
async function validateOrganization(organizationId: string): Promise<boolean> {
  const result = await db
    .select({ id: organizationTable.id, name: organizationTable.name })
    .from(organizationTable)
    .where(eq(organizationTable.id, organizationId))
    .limit(1);

  return result.length > 0;
}

/**
 * Import a single order
 */
async function importOrder(order: ProcessedOrder, index: number): Promise<{ orderNumber: string; orderId: string } | null> {
  // Check for duplicate - skip if this stripePaymentIntentId already exists
  if (order.stripePaymentId) {
    const existingPayment = await db
      .select({ id: orderPaymentTable.id })
      .from(orderPaymentTable)
      .where(eq(orderPaymentTable.stripePaymentIntentId, order.stripePaymentId))
      .limit(1);

    if (existingPayment.length > 0) {
      console.log(`  [${index + 1}] ⏭️  Skipped - already imported (payment ${order.stripePaymentId.slice(0, 20)}...)`);
      return null;
    }
  }

  const year = order.orderDate.getFullYear();
  const orderNumber = await generateOrderNumber(year);

  console.log(`  [${index + 1}] Creating order ${orderNumber} for org ${order.organizationId.slice(0, 8)}...`);
  console.log(`      Products: ${order.teamQuantity} team(s), ${order.tentQuantity} tent(s)`);
  console.log(`      Total: $${order.totalAmount}, Paid: $${order.amountPaid}, Balance: $${order.balanceOwed}`);

  if (DRY_RUN) {
    console.log(`      [DRY RUN] Would create order, items, and payment`);
    return { orderNumber, orderId: 'dry-run-id' };
  }

  // Start transaction
  return await db.transaction(async (tx) => {
    // 1. Create the order
    const [insertedOrder] = await tx
      .insert(orderTable)
      .values({
        orderNumber,
        organizationId: order.organizationId,
        eventYearId: EVENT_YEAR_ID,
        status: order.status,
        totalAmount: order.totalAmount,
        depositAmount: order.depositAmount,
        balanceOwed: order.balanceOwed,
        isManuallyCreated: true,
        notes: order.notes ? `${order.notes}` : 'Imported from WooCommerce',
        metadata: {
          importedAt: new Date().toISOString(),
          importSource: 'woocommerce',
          originalEmail: order.customerEmail,
        },
        createdAt: order.orderDate,
        updatedAt: order.orderDate,
      })
      .returning({ id: orderTable.id });

    const orderId = insertedOrder.id;

    // 2. Create order items
    const orderItems: Array<{
      orderId: string;
      productId: string;
      quantity: number;
      unitPrice: number;
      depositPrice: number;
      totalPrice: number;
      productSnapshot: object;
      createdAt: Date;
    }> = [];

    if (order.teamQuantity > 0) {
      orderItems.push({
        orderId,
        productId: TEAM_PRODUCT_ID,
        quantity: order.teamQuantity,
        unitPrice: TEAM_PRICE,
        depositPrice: TEAM_DEPOSIT,
        totalPrice: order.teamQuantity * TEAM_PRICE,
        productSnapshot: {
          name: 'Company Team',
          price: TEAM_PRICE,
          type: 'team_registration',
        },
        createdAt: order.orderDate,
      });
    }

    if (order.tentQuantity > 0) {
      orderItems.push({
        orderId,
        productId: TENT_PRODUCT_ID,
        quantity: order.tentQuantity,
        unitPrice: TENT_PRICE,
        depositPrice: 0,
        totalPrice: order.tentQuantity * TENT_PRICE,
        productSnapshot: {
          name: 'Tent Rental',
          price: TENT_PRICE,
          type: 'tent_rental',
        },
        createdAt: order.orderDate,
      });
    }

    if (orderItems.length > 0) {
      await tx.insert(orderItemTable).values(orderItems);
    }

    // 3. Create payment record if amount was paid
    if (order.amountPaid > 0) {
      const paymentType = order.amountPaid >= order.totalAmount
        ? PaymentType.BALANCE_PAYMENT
        : PaymentType.DEPOSIT_PAYMENT;

      await tx.insert(orderPaymentTable).values({
        orderId,
        type: paymentType,
        status: PaymentStatus.COMPLETED,
        amount: order.amountPaid,
        stripePaymentIntentId: order.stripePaymentId,
        paymentMethodType: 'card',
        processedAt: order.paymentDate || order.orderDate,
        metadata: {
          importedFromWooCommerce: true,
          importedAt: new Date().toISOString(),
        },
        createdAt: order.paymentDate || order.orderDate,
      });
    }

    // 4. Update product sold counts
    if (order.teamQuantity > 0) {
      await tx
        .update(productTable)
        .set({
          soldCount: sql`${productTable.soldCount} + ${order.teamQuantity}`,
        })
        .where(eq(productTable.id, TEAM_PRODUCT_ID));
    }

    if (order.tentQuantity > 0) {
      await tx
        .update(productTable)
        .set({
          soldCount: sql`${productTable.soldCount} + ${order.tentQuantity}`,
        })
        .where(eq(productTable.id, TENT_PRODUCT_ID));
    }

    // 5. Create company team records for team purchases
    if (order.teamQuantity > 0) {
      // Get existing team count for this organization to determine next team number
      const existingTeams = await tx
        .select({ teamNumber: companyTeamTable.teamNumber })
        .from(companyTeamTable)
        .where(
          and(
            eq(companyTeamTable.organizationId, order.organizationId),
            eq(companyTeamTable.eventYearId, EVENT_YEAR_ID)
          )
        )
        .orderBy(desc(companyTeamTable.teamNumber))
        .limit(1);

      const startingTeamNumber = existingTeams.length > 0 ? existingTeams[0].teamNumber + 1 : 1;

      // Create team records for each team purchased
      const teamsToCreate = [];
      for (let i = 0; i < order.teamQuantity; i++) {
        teamsToCreate.push({
          organizationId: order.organizationId,
          eventYearId: EVENT_YEAR_ID,
          teamNumber: startingTeamNumber + i,
          name: null, // Let users set custom names later
          isPaid: true,
          createdAt: order.orderDate,
        });
      }

      await tx.insert(companyTeamTable).values(teamsToCreate);
      console.log(`      Created ${order.teamQuantity} company team record(s)`);
    }

    // 6. Create invoice
    const invoiceNumber = await generateInvoiceNumber(year);
    const invoiceStatus = order.balanceOwed <= 0 ? 'paid' : 'sent';

    await tx.insert(orderInvoiceTable).values({
      orderId,
      invoiceNumber,
      totalAmount: order.totalAmount,
      paidAmount: order.amountPaid,
      balanceOwed: order.balanceOwed,
      status: invoiceStatus,
      dueDate: new Date(order.orderDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from order
      paidAt: order.balanceOwed <= 0 ? (order.paymentDate || order.orderDate) : null,
      sentAt: order.orderDate,
      notes: 'Imported from WooCommerce',
      metadata: {
        importedFromWooCommerce: true,
        importedAt: new Date().toISOString(),
      },
      createdAt: order.orderDate,
      updatedAt: order.orderDate,
    });

    console.log(`      Created order ${orderId.slice(0, 8)}... with invoice ${invoiceNumber}`);
    return { orderNumber, orderId };
  });
}

// ============================================
// Main Import Function
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const csvPath = args[0] || 'scripts/import-orders.csv';

  console.log('='.repeat(60));
  console.log('WooCommerce Order Import Script');
  console.log('='.repeat(60));
  console.log(`CSV File: ${csvPath}`);
  console.log(`Event Year ID: ${EVENT_YEAR_ID}`);
  console.log(`DRY RUN: ${DRY_RUN ? 'YES (no changes will be made)' : 'NO (changes will be committed)'}`);
  console.log('='.repeat(60));

  if (DRY_RUN) {
    console.log('\n*** DRY RUN MODE ***');
    console.log('Remove --dry-run flag to actually import orders.\n');
  }

  // Read and parse CSV
  let csvContent: string;
  try {
    csvContent = readFileSync(csvPath, 'utf-8');
  } catch (e) {
    console.error(`ERROR: Could not read file: ${csvPath}`);
    process.exit(1);
  }

  const rows: CsvRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  console.log(`Found ${rows.length} orders to import\n`);

  // Parse and validate all rows first
  console.log('Validating CSV data...');
  const orders: ProcessedOrder[] = [];
  const skippedRows: string[] = [];
  const validationErrors: string[] = [];

  // UUID regex for validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Skip rows with placeholder or missing organization IDs
    if (!row.organizationId || !uuidRegex.test(row.organizationId) || row.organizationId.includes('xxxx')) {
      skippedRows.push(`Row ${i + 2}: Skipped - invalid/placeholder organizationId (${row.organizationId || 'empty'})`);
      continue;
    }

    try {
      const order = parseRow(row, i);
      orders.push(order);
    } catch (e) {
      validationErrors.push((e as Error).message);
    }
  }

  if (skippedRows.length > 0) {
    console.log(`\nSkipped ${skippedRows.length} rows with missing/placeholder organization IDs:`);
    skippedRows.forEach(msg => console.log(`  - ${msg}`));
  }

  if (validationErrors.length > 0) {
    console.error('\nValidation errors:');
    validationErrors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  if (orders.length === 0) {
    console.error('\nNo valid orders to import. Please fill in organization IDs in the CSV.');
    process.exit(1);
  }

  console.log(`\n${orders.length} orders ready to import.\n`);

  // Validate organizations exist
  console.log('Validating organizations exist in database...');
  const uniqueOrgIds = [...new Set(orders.map(o => o.organizationId))];
  const missingOrgs: string[] = [];

  for (const orgId of uniqueOrgIds) {
    const exists = await validateOrganization(orgId);
    if (!exists) {
      missingOrgs.push(orgId);
    }
  }

  if (missingOrgs.length > 0) {
    console.error('\nERROR: The following organization IDs do not exist in the database:');
    missingOrgs.forEach(id => console.error(`  - ${id}`));
    console.error('\nPlease ensure all organizations are created before importing orders.');
    process.exit(1);
  }

  console.log(`All ${uniqueOrgIds.length} organizations validated.\n`);

  // Import orders
  console.log('Importing orders...\n');
  const results: Array<{ orderNumber: string; orderId: string }> = [];
  let skippedDuplicates = 0;

  for (let i = 0; i < orders.length; i++) {
    try {
      const result = await importOrder(orders[i], i);
      if (result === null) {
        skippedDuplicates++;
      } else {
        results.push(result);
      }
    } catch (e) {
      console.error(`\nERROR importing order ${i + 1}: ${(e as Error).message}`);
      if (!DRY_RUN) {
        console.error('Stopping import due to error.');
        process.exit(1);
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Import Summary');
  console.log('='.repeat(60));
  console.log(`Orders imported: ${results.length}`);
  console.log(`Orders skipped (already imported): ${skippedDuplicates}`);

  if (!DRY_RUN && results.length > 0) {
    console.log('\nCreated orders:');
    results.forEach(r => console.log(`  - ${r.orderNumber} (${r.orderId})`));
  }

  console.log('\nDone!');

  await pool.end();
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
