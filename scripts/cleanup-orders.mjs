#!/usr/bin/env node

/**
 * Cleanup script for abandoned pending orders
 *
 * Usage:
 *   # Dry run (preview)
 *   node scripts/cleanup-orders.mjs
 *
 *   # Execute cleanup
 *   node scripts/cleanup-orders.mjs --execute
 *
 *   # Quick cleanup (1 hour old)
 *   node scripts/cleanup-orders.mjs --quick --execute
 *
 *   # Custom age threshold
 *   node scripts/cleanup-orders.mjs --hours 48 --execute
 */

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function cleanupOrders() {
  const args = process.argv.slice(2);

  const options = {
    execute: args.includes('--execute'),
    quick: args.includes('--quick'),
    olderThanHours: 24
  };

  // Parse custom hours
  const hoursIndex = args.indexOf('--hours');
  if (hoursIndex !== -1 && args[hoursIndex + 1]) {
    options.olderThanHours = parseInt(args[hoursIndex + 1]) || 24;
  }

  console.log('🧹 Abandoned Orders Cleanup Script');
  console.log('=====================================');
  console.log(`Mode: ${options.execute ? '🗑️  EXECUTE' : '👀 DRY RUN'}`);
  console.log(`Age threshold: ${options.quick ? '1 hour (quick)' : `${options.olderThanHours} hours`}`);
  console.log('');

  if (!options.execute) {
    console.log('⚠️  This is a DRY RUN. No orders will be deleted.');
    console.log('   Add --execute flag to actually delete orders.');
    console.log('');
  }

  try {
    const response = await fetch(`${API_URL}/api/orders/cleanup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    const data = await response.json();

    if (data.success) {
      const result = data.result;

      console.log('✅ Cleanup completed successfully!');
      console.log('');
      console.log('📊 Results:');
      console.log(`   Orders found: ${result.foundOrders}`);
      console.log(`   Orders deleted: ${result.deletedOrders}`);
      console.log(`   Age threshold: ${result.olderThanHours} hours`);
      console.log(`   Mode: ${result.dryRun ? 'Dry Run' : 'Executed'}`);

      if (result.foundOrders > 0 && result.dryRun) {
        console.log('');
        console.log('💡 To actually delete these orders, run:');
        console.log(`   node scripts/cleanup-orders.mjs --execute${options.quick ? ' --quick' : ''}`);
      }
    } else {
      console.error('❌ Cleanup failed:', data.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Script error:', error.message);
    process.exit(1);
  }
}

// Help text
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Abandoned Orders Cleanup Script

Usage:
  node scripts/cleanup-orders.mjs [options]

Options:
  --execute          Actually delete orders (default: dry run)
  --quick            Clean orders older than 1 hour
  --hours <number>   Custom age threshold in hours (default: 24)
  --help, -h         Show this help message

Examples:
  node scripts/cleanup-orders.mjs                    # Dry run (24h)
  node scripts/cleanup-orders.mjs --execute          # Execute (24h)
  node scripts/cleanup-orders.mjs --quick --execute  # Quick cleanup (1h)
  node scripts/cleanup-orders.mjs --hours 48         # Dry run (48h)
`);
  process.exit(0);
}

cleanupOrders();