'use server';

import { db, sql } from '@workspace/database/client';

export interface CleanupOptions {
  /**
   * How old should pending orders be before cleanup (in hours)
   * Default: 24 hours
   */
  olderThanHours?: number;

  /**
   * Whether to actually delete or just return count
   * Default: false (dry run)
   */
  execute?: boolean;

  /**
   * Specific event year to cleanup (optional)
   */
  eventYearId?: string;
}

export interface CleanupResult {
  foundOrders: number;
  deletedOrders: number;
  dryRun: boolean;
  olderThanHours: number;
}

/**
 * Cleanup abandoned pending orders that haven't been paid
 *
 * @param options Cleanup configuration options
 * @returns Promise<CleanupResult> Results of the cleanup operation
 */
export async function cleanupAbandonedOrders(options: CleanupOptions = {}): Promise<CleanupResult> {
  const {
    olderThanHours = 24,
    execute = false,
    eventYearId
  } = options;

  console.log('🧹 Starting abandoned orders cleanup...', {
    olderThanHours,
    execute: execute ? 'EXECUTE' : 'DRY RUN',
    eventYearId
  });

  try {
    // Calculate cutoff timestamp
    const cutoffTime = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000));

    // First, count how many orders would be affected using raw SQL
    const countQuery = eventYearId
      ? sql`
          SELECT COUNT(*) as count
          FROM "order"
          WHERE status = 'pending'
          AND "balanceOwed" = "totalAmount"
          AND "createdAt" < ${cutoffTime}
          AND "eventYearId" = ${eventYearId}
        `
      : sql`
          SELECT COUNT(*) as count
          FROM "order"
          WHERE status = 'pending'
          AND "balanceOwed" = "totalAmount"
          AND "createdAt" < ${cutoffTime}
        `;

    const countResult = await db.execute(countQuery);
    const foundOrders = parseInt(countResult.rows[0]?.count as string || '0');

    console.log(`📊 Found ${foundOrders} abandoned pending orders older than ${olderThanHours} hours`);

    let deletedOrders = 0;

    if (execute && foundOrders > 0) {
      // Delete the abandoned orders using raw SQL
      const deleteQuery = eventYearId
        ? sql`
            DELETE FROM "order"
            WHERE status = 'pending'
            AND "balanceOwed" = "totalAmount"
            AND "createdAt" < ${cutoffTime}
            AND "eventYearId" = ${eventYearId}
          `
        : sql`
            DELETE FROM "order"
            WHERE status = 'pending'
            AND "balanceOwed" = "totalAmount"
            AND "createdAt" < ${cutoffTime}
          `;

      const deleteResult = await db.execute(deleteQuery);
      deletedOrders = (deleteResult as any).rowsAffected || 0;

      console.log(`🗑️ Deleted ${deletedOrders} abandoned pending orders`);
    } else if (!execute) {
      console.log('🔍 DRY RUN: No orders were deleted. Set execute: true to actually delete.');
    }

    return {
      foundOrders,
      deletedOrders,
      dryRun: !execute,
      olderThanHours
    };

  } catch (error) {
    console.error('❌ Error during abandoned orders cleanup:', error);
    throw new Error(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Quick cleanup for testing - removes orders older than 1 hour
 */
export async function quickCleanupAbandonedOrders(execute: boolean = false): Promise<CleanupResult> {
  return cleanupAbandonedOrders({
    olderThanHours: 1,
    execute
  });
}

/**
 * Daily cleanup - removes orders older than 24 hours
 * This could be called by a cron job or scheduled task
 */
export async function dailyCleanupAbandonedOrders(): Promise<CleanupResult> {
  return cleanupAbandonedOrders({
    olderThanHours: 24,
    execute: true
  });
}