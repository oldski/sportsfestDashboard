import { NextRequest, NextResponse } from 'next/server';
import { cleanupAbandonedOrders, quickCleanupAbandonedOrders } from '~/lib/cleanup-abandoned-orders';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const {
      olderThanHours = 24,
      execute = false,
      eventYearId,
      quick = false
    } = body;

    // Quick cleanup for testing (1 hour old orders)
    if (quick) {
      const result = await quickCleanupAbandonedOrders(execute);
      return NextResponse.json({
        success: true,
        message: `Quick cleanup completed. Found: ${result.foundOrders}, Deleted: ${result.deletedOrders}`,
        result
      });
    }

    // Regular cleanup
    const result = await cleanupAbandonedOrders({
      olderThanHours,
      execute,
      eventYearId
    });

    return NextResponse.json({
      success: true,
      message: `Cleanup completed. Found: ${result.foundOrders}, Deleted: ${result.deletedOrders}`,
      result
    });

  } catch (error) {
    console.error('Cleanup API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Cleanup failed'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Abandoned Orders Cleanup API',
    usage: {
      endpoint: 'POST /api/orders/cleanup',
      parameters: {
        olderThanHours: 'number (default: 24) - How old orders should be before cleanup',
        execute: 'boolean (default: false) - Set to true to actually delete, false for dry run',
        eventYearId: 'string (optional) - Specific event year to cleanup',
        quick: 'boolean (default: false) - Quick cleanup for orders older than 1 hour'
      },
      examples: {
        dryRun: '{ "olderThanHours": 24, "execute": false }',
        execute: '{ "olderThanHours": 24, "execute": true }',
        quickTest: '{ "quick": true, "execute": true }'
      }
    }
  });
}