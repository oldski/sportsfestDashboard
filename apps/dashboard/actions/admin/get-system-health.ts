'use server';

import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getActiveEventYear } from './get-event-year';
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
    totalUsers: number;
    totalOrganizations: number;
    activeConnections: number;
    querySuccessRate: number;
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

  try {
    const activeEvent = await getActiveEventYear();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // 1. PAYMENT PROCESSING HEALTH (Priority #1)
    const paymentHealthQuery = await db
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
      );

    const recentPaymentsQuery = await db
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
      );

    // 2. REGISTRATION SYSTEM STATUS (Priority #2)
    const [registrationHealthQuery] = await db
      .select({
        newUsersToday: sql<number>`(SELECT COUNT(*) FROM ${userTable} WHERE ${userTable.createdAt} >= ${today})`,
        newUsersThisWeek: sql<number>`(SELECT COUNT(*) FROM ${userTable} WHERE ${userTable.createdAt} >= ${weekAgo})`,
        newTeamsToday: sql<number>`(SELECT COUNT(*) FROM ${companyTeamTable} WHERE ${companyTeamTable.createdAt} >= ${today} ${activeEvent?.id ? sql`AND ${companyTeamTable.eventYearId} = ${activeEvent.id}` : sql``})`,
        newPlayersToday: sql<number>`(SELECT COUNT(*) FROM ${playerTable} WHERE ${playerTable.createdAt} >= ${today} ${activeEvent?.id ? sql`AND ${playerTable.eventYearId} = ${activeEvent.id}` : sql``})`
      })
      .from(sql`(SELECT 1) as dummy`);

    // 3. DATABASE PERFORMANCE (Priority #3)
    const [databaseHealthQuery] = await db
      .select({
        totalUsers: sql<number>`(SELECT COUNT(*) FROM ${userTable})`,
        totalOrganizations: sql<number>`(SELECT COUNT(*) FROM ${organizationTable})`,
        activeMemberships: sql<number>`(SELECT COUNT(*) FROM ${membershipTable})`
      })
      .from(sql`(SELECT 1) as dummy`);

    // Execute all queries
    const [paymentHealth, recentPayments, registrationHealth, databaseHealth] = await Promise.all([
      paymentHealthQuery,
      recentPaymentsQuery,
      Promise.resolve([registrationHealthQuery]), // Wrap in array since we destructured above
      Promise.resolve([databaseHealthQuery]) // Wrap in array since we destructured above
    ]);

    const dbResponseTime = Date.now() - startTime;

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

    // Determine service status with development environment handling
    const services = {
      database: dbResponseTime < 1000 ? 'healthy' : dbResponseTime < 3000 ? 'degraded' : 'down',
      payments: paymentData.totalPayments > 0 ? (successRate >= 95 ? 'healthy' : successRate >= 85 ? 'degraded' : 'down') : 'healthy', // Healthy if no payments to process
      registration: 'healthy', // If queries succeed, registration system is working
      email: 'healthy' // Assume healthy unless we implement email monitoring
    } as const;

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
        systemUptime: 99.5 // Mock for now, would need external monitoring
      },
      databaseHealth: {
        responseTime: dbResponseTime,
        totalUsers: databaseData.totalUsers,
        totalOrganizations: databaseData.totalOrganizations,
        activeConnections: databaseData.activeMemberships,
        querySuccessRate: 99.8 // Mock for now
      },
      overallHealth: {
        score: overallScore,
        status,
        lastUpdated: now
      },
      services
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
        totalUsers: 0,
        totalOrganizations: 0,
        activeConnections: 0,
        querySuccessRate: 0
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
      }
    };
  }
}