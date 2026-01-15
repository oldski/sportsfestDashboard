'use server';

import { auth } from '@workspace/auth';
import { checkEmailHealth, type EmailHealthStatus } from '@workspace/email/provider';

import { isSuperAdmin } from '~/lib/admin-utils';
import { getActiveEventYear } from './get-event-year';
import { getSentryStats, type SentryStats } from './get-sentry-stats';
import { db, sql, eq, and, gte, lte } from '@workspace/database/client';
import {
  orderPaymentTable,
  orderTable,
  userTable,
  organizationTable,
  membershipTable,
  playerTable,
  companyTeamTable,
  PaymentStatus,
  OrderStatus
} from '@workspace/database/schema';

export interface SystemHealthData {
  // Payment Processing Health
  paymentHealth: {
    successRate: number;
    totalPayments: number;
    completedPayments: number;
    failedPayments: number;
    pendingPayments: number;
    averageProcessingTime: number; // in minutes
    recentPaymentTrend: 'up' | 'down' | 'stable';
  };

  // Registration System Status
  registrationHealth: {
    newUsersToday: number;
    newUsersThisWeek: number;
    newTeamsToday: number;
    newPlayersToday: number;
    registrationRate: number; // registrations per hour
    systemUptime: number; // percentage
  };

  // Database Performance
  databaseHealth: {
    responseTime: number; // in milliseconds
    avgQueryTime: number; // average query time in milliseconds
    totalUsers: number;
    totalOrganizations: number;
    activeConnections: number; // actual PostgreSQL connections
  };

  // Overall System Status
  overallHealth: {
    score: number; // 0-100
    status: 'excellent' | 'good' | 'warning' | 'critical';
    lastUpdated: Date;
  };

  // Service Status
  services: {
    database: 'healthy' | 'degraded' | 'down';
    payments: 'healthy' | 'degraded' | 'down';
    registration: 'healthy' | 'degraded' | 'down';
    email: 'healthy' | 'degraded' | 'down';
  };

  // Service Messages (reasons for status)
  serviceMessages: {
    database: string;
    payments: string;
    registration: string;
    email: string;
  };
}

export async function getSystemHealth(): Promise<SystemHealthData> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access system health data');
  }

  const startTime = Date.now();
  const queryTimes: number[] = [];

  // Helper to track query execution time
  const trackQuery = async <T>(queryFn: () => Promise<T>): Promise<T> => {
    const start = Date.now();
    const result = await queryFn();
    queryTimes.push(Date.now() - start);
    return result;
  };

  try {
    const activeEvent = await getActiveEventYear();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // 1. PAYMENT PROCESSING HEALTH (Priority #1)
    const paymentHealthQuery = await trackQuery(() => db
      .select({
        totalPayments: sql<number>`COUNT(*)`,
        completedPayments: sql<number>`COUNT(CASE WHEN ${orderPaymentTable.status} = 'completed' THEN 1 END)`,
        failedPayments: sql<number>`COUNT(CASE WHEN ${orderPaymentTable.status} = 'failed' THEN 1 END)`,
        pendingPayments: sql<number>`COUNT(CASE WHEN ${orderPaymentTable.status} = 'pending' THEN 1 END)`,
        avgProcessingTime: sql<number>`AVG(EXTRACT(EPOCH FROM (${orderPaymentTable.processedAt} - ${orderPaymentTable.createdAt})) / 60)`
      })
      .from(orderPaymentTable)
      .innerJoin(orderTable, eq(orderPaymentTable.orderId, orderTable.id))
      .where(
        activeEvent?.id
          ? and(
              eq(orderTable.eventYearId, activeEvent.id),
              gte(orderPaymentTable.createdAt, weekAgo)
            )
          : gte(orderPaymentTable.createdAt, weekAgo)
      )
    );

    const recentPaymentsQuery = await trackQuery(() => db
      .select({
        recentCount: sql<number>`COUNT(*)`
      })
      .from(orderPaymentTable)
      .innerJoin(orderTable, eq(orderPaymentTable.orderId, orderTable.id))
      .where(
        activeEvent?.id
          ? and(
              eq(orderTable.eventYearId, activeEvent.id),
              gte(orderPaymentTable.createdAt, hourAgo)
            )
          : gte(orderPaymentTable.createdAt, hourAgo)
      )
    );

    // 2. REGISTRATION SYSTEM STATUS (Priority #2)
    const [registrationHealthQuery] = await trackQuery(() => db
      .select({
        newUsersToday: sql<number>`(SELECT COUNT(*) FROM ${userTable} WHERE ${userTable.createdAt} >= ${today})`,
        newUsersThisWeek: sql<number>`(SELECT COUNT(*) FROM ${userTable} WHERE ${userTable.createdAt} >= ${weekAgo})`,
        newTeamsToday: sql<number>`(SELECT COUNT(*) FROM ${companyTeamTable} WHERE ${companyTeamTable.createdAt} >= ${today} ${activeEvent?.id ? sql`AND ${companyTeamTable.eventYearId} = ${activeEvent.id}` : sql``})`,
        newPlayersToday: sql<number>`(SELECT COUNT(*) FROM ${playerTable} WHERE ${playerTable.createdAt} >= ${today} ${activeEvent?.id ? sql`AND ${playerTable.eventYearId} = ${activeEvent.id}` : sql``})`
      })
      .from(sql`(SELECT 1) as dummy`)
    );

    // 3. DATABASE PERFORMANCE (Priority #3)
    const [databaseHealthQuery] = await trackQuery(() => db
      .select({
        totalUsers: sql<number>`(SELECT COUNT(*) FROM ${userTable})`,
        totalOrganizations: sql<number>`(SELECT COUNT(*) FROM ${organizationTable})`,
      })
      .from(sql`(SELECT 1) as dummy`)
    );

    // 4. Get actual PostgreSQL connection count
    const [connectionCount] = await trackQuery(() => db
      .select({
        count: sql<number>`(SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database())`
      })
      .from(sql`(SELECT 1) as dummy`)
    );

    // 5. Check email service status using the email package
    const emailHealth = await checkEmailHealth();

    // Execute remaining queries and get Sentry stats for uptime
    const [paymentHealth, recentPayments, registrationHealth, databaseHealth, sentryStats] = await Promise.all([
      Promise.resolve(paymentHealthQuery),
      Promise.resolve(recentPaymentsQuery),
      Promise.resolve([registrationHealthQuery]),
      Promise.resolve([databaseHealthQuery]),
      getSentryStats().catch(() => null)
    ]);

    const dbResponseTime = Date.now() - startTime;
    const avgQueryTime = queryTimes.length > 0
      ? Math.round(queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length)
      : 0;

    // Process payment health data
    const paymentData = paymentHealth[0];
    const successRate = paymentData.totalPayments > 0
      ? Math.round((paymentData.completedPayments / paymentData.totalPayments) * 100)
      : 100;

    // Calculate registration rate (per hour)
    const registrationData = registrationHealth[0];
    const registrationRate = registrationData.newUsersToday > 0
      ? Math.round(registrationData.newUsersToday / 24 * 10) / 10
      : 0;

    const databaseData = databaseHealth[0];

    // Determine service status with real data
    const databaseStatus = dbResponseTime < 1000 ? 'healthy' : dbResponseTime < 3000 ? 'degraded' : 'down';
    const paymentsStatus = paymentData.totalPayments > 0 ? (successRate >= 95 ? 'healthy' : successRate >= 85 ? 'degraded' : 'down') : 'healthy';
    const registrationStatus = sentryStats?.isConnected && sentryStats.status === 'critical' ? 'degraded' : 'healthy';

    const services = {
      database: databaseStatus,
      payments: paymentsStatus,
      registration: registrationStatus,
      email: emailHealth.status
    } as const;

    // Generate meaningful messages for each service
    const serviceMessages = {
      database: databaseStatus === 'healthy'
        ? `Response time: ${dbResponseTime}ms (avg query: ${avgQueryTime}ms)`
        : databaseStatus === 'degraded'
          ? `Slow response time: ${dbResponseTime}ms - performance degraded`
          : `Database not responding (${dbResponseTime}ms timeout)`,
      payments: paymentsStatus === 'healthy'
        ? paymentData.totalPayments > 0
          ? `${successRate}% success rate (${paymentData.completedPayments}/${paymentData.totalPayments} payments)`
          : 'No recent payments to process'
        : `${successRate}% success rate - ${paymentData.failedPayments} failed payments`,
      registration: registrationStatus === 'healthy'
        ? `System operational - ${registrationData.newUsersToday} new users today`
        : 'Elevated error rate detected in Sentry',
      email: emailHealth.message
    };

    // Calculate overall health score with development environment handling
    const paymentScore = paymentData.totalPayments > 0 ? Math.min(successRate, 100) : 95; // Default to good if no payments exist
    const databaseScore = Math.max(0, 100 - (dbResponseTime / 50)); // 50ms = 1 point deduction
    const registrationScore = 100; // If queries succeed, registration system is healthy

    const overallScore = Math.round((paymentScore * 0.5 + databaseScore * 0.3 + registrationScore * 0.2));

    let status: 'excellent' | 'good' | 'warning' | 'critical';
    if (overallScore >= 90) status = 'excellent';
    else if (overallScore >= 70) status = 'good';
    else if (overallScore >= 50) status = 'warning';
    else status = 'critical';


    return {
      paymentHealth: {
        successRate,
        totalPayments: paymentData.totalPayments,
        completedPayments: paymentData.completedPayments,
        failedPayments: paymentData.failedPayments,
        pendingPayments: paymentData.pendingPayments,
        averageProcessingTime: Math.round(paymentData.avgProcessingTime || 0),
        recentPaymentTrend: recentPayments[0].recentCount > 0 ? 'up' : 'stable'
      },
      registrationHealth: {
        newUsersToday: registrationData.newUsersToday,
        newUsersThisWeek: registrationData.newUsersThisWeek,
        newTeamsToday: registrationData.newTeamsToday,
        newPlayersToday: registrationData.newPlayersToday,
        registrationRate,
        // Use Sentry crash-free rate as proxy for system uptime, fallback to 99.5 if not connected
        systemUptime: sentryStats?.isConnected
          ? Math.max(0, 100 - (sentryStats.errors.total24h * 0.5))
          : 99.5
      },
      databaseHealth: {
        responseTime: dbResponseTime,
        avgQueryTime,
        totalUsers: databaseData.totalUsers,
        totalOrganizations: databaseData.totalOrganizations,
        activeConnections: connectionCount?.count ?? 0
      },
      overallHealth: {
        score: overallScore,
        status,
        lastUpdated: now
      },
      services,
      serviceMessages
    };

  } catch (error) {
    console.error('Error fetching system health:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');

    // Return degraded status if queries fail
    return {
      paymentHealth: {
        successRate: 0,
        totalPayments: 0,
        completedPayments: 0,
        failedPayments: 0,
        pendingPayments: 0,
        averageProcessingTime: 0,
        recentPaymentTrend: 'stable'
      },
      registrationHealth: {
        newUsersToday: 0,
        newUsersThisWeek: 0,
        newTeamsToday: 0,
        newPlayersToday: 0,
        registrationRate: 0,
        systemUptime: 0
      },
      databaseHealth: {
        responseTime: 5000,
        avgQueryTime: 0,
        totalUsers: 0,
        totalOrganizations: 0,
        activeConnections: 0
      },
      overallHealth: {
        score: 0,
        status: 'critical',
        lastUpdated: new Date()
      },
      services: {
        database: 'down',
        payments: 'down',
        registration: 'down',
        email: 'down'
      },
      serviceMessages: {
        database: 'Failed to connect to database',
        payments: 'Unable to fetch payment data',
        registration: 'Unable to fetch registration data',
        email: 'Unable to check email service status'
      }
    };
  }
}