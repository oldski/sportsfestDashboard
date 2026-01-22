import { NextResponse } from 'next/server';

import { baseUrl } from '@workspace/routes';
import { sendDailyDigestEmail } from '@workspace/email/send-daily-digest-email';

import { getDailyDigestStats } from '~/data/admin/get-daily-digest-stats';

// Admin recipients for the daily digest
const DIGEST_RECIPIENTS = [
  'prem@sportsfest.com',
  'dave@sportsfest.com',
  'kolds@laybl-labs.com'
];

/**
 * Check if we're currently in Eastern Daylight Time (EDT)
 * EDT is observed from the second Sunday in March to the first Sunday in November
 */
function isEasternDaylightTime(): boolean {
  const now = new Date();
  const year = now.getUTCFullYear();

  // Second Sunday in March (start of EDT)
  const marchFirst = new Date(Date.UTC(year, 2, 1));
  const daysUntilSecondSunday = (14 - marchFirst.getUTCDay()) % 7 + 7;
  const edtStart = new Date(Date.UTC(year, 2, 1 + daysUntilSecondSunday, 7)); // 2am ET = 7am UTC

  // First Sunday in November (end of EDT)
  const novFirst = new Date(Date.UTC(year, 10, 1));
  const daysUntilFirstSunday = (7 - novFirst.getUTCDay()) % 7;
  const edtEnd = new Date(Date.UTC(year, 10, 1 + daysUntilFirstSunday, 6)); // 2am ET = 6am UTC (still in EDT)

  return now >= edtStart && now < edtEnd;
}

export async function GET(request: Request): Promise<NextResponse> {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Check if this is the correct cron run for the current timezone
  // We have two crons: 12pm UTC (8am EDT) and 1pm UTC (8am EST)
  const currentHourUTC = new Date().getUTCHours();
  const isEDT = isEasternDaylightTime();

  // During EDT: only run at 12pm UTC (8am EDT)
  // During EST: only run at 1pm UTC (8am EST)
  if ((isEDT && currentHourUTC !== 12) || (!isEDT && currentHourUTC !== 13)) {
    return NextResponse.json({
      success: true,
      message: 'Skipped - not the correct timezone window',
      isEDT,
      currentHourUTC
    });
  }

  try {
    // Gather stats for the last 24 hours
    const stats = await getDailyDigestStats();

    // Send the digest email
    await sendDailyDigestEmail({
      ...stats,
      dashboardUrl: `${baseUrl.Dashboard}/admin/dashboard`,
      recipients: DIGEST_RECIPIENTS
    });

    return NextResponse.json({
      success: true,
      message: 'Daily digest sent successfully',
      stats: {
        signUps: stats.newSignUps.count,
        organizations: stats.newOrganizations.count,
        orders: stats.orders.totalCount,
        revenue: stats.orders.totalRevenue,
        recipientCount: DIGEST_RECIPIENTS.length
      }
    });
  } catch (error) {
    console.error('Failed to send daily digest:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
