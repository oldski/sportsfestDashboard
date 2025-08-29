'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, sql } from '@workspace/database/client';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';

export interface CompanyOverview {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  playerCount: number;
  teamCount: number;
  totalRevenue: number;
  hasActiveRegistration: boolean;
  createdAt: Date;
}

export async function getAllCompanies(): Promise<CompanyOverview[]> {
  const { session } = await getAuthContext();
  
  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access company data');
  }

  const result = await db.execute(sql`
    SELECT 
      o.id,
      o.name,
      o.city,
      o.state,
      o.created_at,
      COALESCE(player_stats.player_count, 0) as player_count,
      COALESCE(team_stats.team_count, 0) as team_count,
      COALESCE(revenue_stats.total_revenue, 0) as total_revenue,
      CASE WHEN recent_activity.has_activity THEN true ELSE false END as has_active_registration
    FROM organization o
    LEFT JOIN (
      SELECT 
        organization_id, 
        COUNT(*) as player_count 
      FROM player 
      GROUP BY organization_id
    ) player_stats ON o.id = player_stats.organization_id
    LEFT JOIN (
      SELECT 
        organization_id, 
        COUNT(*) as team_count 
      FROM company_team 
      GROUP BY organization_id
    ) team_stats ON o.id = team_stats.organization_id
    LEFT JOIN (
      SELECT 
        organization_id, 
        SUM(amount) as total_revenue 
      FROM payment 
      WHERE status = 'completed'
      GROUP BY organization_id
    ) revenue_stats ON o.id = revenue_stats.organization_id
    LEFT JOIN (
      SELECT 
        organization_id,
        true as has_activity
      FROM player 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY organization_id
    ) recent_activity ON o.id = recent_activity.organization_id
    ORDER BY o.name ASC
  `);

  return (result as unknown as any[]).map((row: any) => ({
    id: row.id as string,
    name: row.name as string,
    city: row.city as string | null,
    state: row.state as string | null,
    playerCount: Number(row.player_count),
    teamCount: Number(row.team_count),
    totalRevenue: Number(row.total_revenue || 0),
    hasActiveRegistration: Boolean(row.has_active_registration),
    createdAt: new Date(row.created_at as string)
  }));
}