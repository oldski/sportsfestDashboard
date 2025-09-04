import 'server-only';

import { cleanupExpiredCartSessions } from './cart-session';

// Main cleanup function that can be called from various places
export async function runCartCleanup() {
  try {
    console.log('Starting cart session cleanup...');
    
    const result = await cleanupExpiredCartSessions();
    
    console.log('Cart session cleanup completed successfully');
    return { success: true, result };
  } catch (error) {
    console.error('Cart session cleanup failed:', error);
    return { success: false, error };
  }
}

// Setup instructions for deployment:
// 
// 1. Vercel Cron Jobs:
//    Add to vercel.json:
//    {
//      "crons": [
//        {
//          "path": "/api/cart/cleanup",
//          "schedule": "0 */6 * * *"
//        }
//      ]
//    }
//
// 2. Manual cleanup (can be called from admin panel):
//    Call the runCartCleanup() function directly
//
// 3. Environment variable for auth (optional):
//    Set CRON_SECRET in environment variables for API route protection