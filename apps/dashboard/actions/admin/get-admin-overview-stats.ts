'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, sql } from '@workspace/database/client';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';

export interface AdminOverviewStats {
  totalCompanies: number;
  newCompaniesThisMonth: number;
  totalPlayers: number;
  newPlayersThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
  totalTentRentals: number;
  tentUtilizationRate: number;
}

export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  const { session } = await getAuthContext();
  
  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access admin statistics');
  }

  // Calculate first day of current month for monthly stats
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);
  const firstDayISO = firstDayOfMonth.toISOString();

  // Get organization statistics with monthly breakdown
  const companyStats = await db.execute(sql`
    SELECT 
      COUNT(*) as total_companies,
      COUNT(*) FILTER (WHERE "billingCustomerId" IS NOT NULL) as new_companies_this_month
    FROM organization
  `);

  // Get user statistics (users as proxy for players since player table might be event-specific)
  const userStats = await db.execute(sql`
    SELECT 
      COUNT(*) as total_users,
      COUNT(*) FILTER (WHERE "createdAt" >= ${firstDayISO}::timestamp) as new_users_this_month
    FROM "user"
  `);

  // Get payment statistics (mock data for now)
  const paymentStats = [{ 
    total_revenue: 25400, 
    revenue_this_month: 4800 
  }];

  // Get tent rental statistics (mock data for now)
  const tentStats = [{ 
    total_tent_rentals: 24, 
    paid_tent_rentals: 18 
  }];

  // Get membership count for better organization tracking
  const membershipStats = await db.execute(sql`
    SELECT COUNT(*) as total_memberships
    FROM membership
  `);

  const companyRow = (companyStats as unknown as any[])[0];
  const userRow = (userStats as unknown as any[])[0];
  const paymentRow = paymentStats[0];
  const tentRow = tentStats[0];
  const membershipRow = (membershipStats as unknown as any[])[0];

  // Calculate tent utilization rate (paid vs total)
  const totalTents = Number(tentRow?.total_tent_rentals || 0);
  const paidTents = Number(tentRow?.paid_tent_rentals || 0);
  const tentUtilization = totalTents > 0 ? Math.round((paidTents / totalTents) * 100) : 0;

  return {
    totalCompanies: Number(companyRow?.total_companies || 0),
    newCompaniesThisMonth: Number(companyRow?.new_companies_this_month || 0),
    totalPlayers: Number(membershipRow?.total_memberships || 0), // Use memberships as player proxy
    newPlayersThisMonth: Number(userRow?.new_users_this_month || 0),
    totalRevenue: Number(paymentRow?.total_revenue || 0),
    revenueThisMonth: Number(paymentRow?.revenue_this_month || 0),
    totalTentRentals: totalTents,
    tentUtilizationRate: tentUtilization
  };
}