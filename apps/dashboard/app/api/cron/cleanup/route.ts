import { NextRequest, NextResponse } from 'next/server';
import { db, sql } from '@workspace/database/client';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Verify this is a legitimate cron request
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[CLEANUP] Starting cart/inventory cleanup job');

    // Get expired cart sessions and their inventory impact
    const expiredCartsResult = await db.execute(sql`
      WITH expired_cart_items AS (
        SELECT
          cs.id as cart_id,
          jsonb_array_elements(cs.cartData) as item
        FROM "cartSession" cs
        WHERE cs.expiresAt < NOW()
      ),
      inventory_to_release AS (
        SELECT
          (item->>'productId')::uuid as product_id,
          SUM((item->>'quantity')::integer) as total_quantity
        FROM expired_cart_items
        WHERE item->>'productId' IS NOT NULL
        GROUP BY (item->>'productId')::uuid
      )
      SELECT
        product_id,
        total_quantity,
        COUNT(*) as affected_carts
      FROM inventory_to_release
      GROUP BY product_id, total_quantity
    `);

    const expiredItems = (expiredCartsResult as any)?.rows || [];
    let totalInventoryReleased = 0;

    // Release inventory for each expired cart item
    for (const item of expiredItems) {
      await db.execute(sql`
        UPDATE product
        SET reservedCount = GREATEST(0, reservedCount - ${item.total_quantity})
        WHERE id = ${item.product_id}
      `);
      totalInventoryReleased += Number(item.total_quantity);
    }

    // Delete expired cart sessions
    const deleteResult = await db.execute(sql`
      DELETE FROM "cartSession"
      WHERE expiresAt < NOW()
    `);

    const deletedCarts = (deleteResult as any)?.rowCount || 0;

    const duration = Date.now() - startTime;

    console.log('[CLEANUP] Cleanup completed successfully:', {
      duration,
      deletedCarts,
      totalInventoryReleased,
      affectedProducts: expiredItems.length,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      stats: {
        duration,
        deletedCarts,
        totalInventoryReleased,
        affectedProducts: expiredItems.length
      }
    });

  } catch (error) {
    console.error('[CLEANUP] Cleanup job failed:', error);

    return NextResponse.json({
      success: false,
      error: 'Cleanup job failed',
      duration: Date.now() - startTime
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Simple health check - count active cart sessions
    const result = await db.execute(sql`
      SELECT
        COUNT(*) as active_carts,
        COUNT(CASE WHEN expiresAt < NOW() THEN 1 END) as expired_carts
      FROM "cartSession"
    `);

    const stats = (result as any)?.rows?.[0];

    return NextResponse.json({
      status: 'healthy',
      activeCarts: Number(stats?.active_carts || 0),
      expiredCarts: Number(stats?.expired_carts || 0),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Database connection failed'
    }, { status: 500 });
  }
}