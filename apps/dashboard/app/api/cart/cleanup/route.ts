import { type NextRequest } from 'next/server';
import { cleanupExpiredCartSessions } from '~/lib/cart-session';

// API route to cleanup expired cart sessions
// This can be called by a cron job or scheduled task
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication/authorization here
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const result = await cleanupExpiredCartSessions();
    
    return Response.json({ 
      success: true, 
      message: 'Expired cart sessions cleaned up successfully'
    });
  } catch (error) {
    console.error('Cart cleanup API error:', error);
    return Response.json(
      { success: false, error: 'Failed to cleanup cart sessions' },
      { status: 500 }
    );
  }
}

// Allow GET requests as well for manual testing
export async function GET() {
  return POST({} as NextRequest);
}