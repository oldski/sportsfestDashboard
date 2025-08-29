'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, sql } from '@workspace/database/client';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';

export interface AdminAlert {
  id: string;
  title: string;
  description: string;
  type: 'error' | 'warning' | 'info' | 'success';
  severity: 'critical' | 'warning' | 'info';
  category: string;
  createdAt: Date;
}

export async function getAdminAlerts(): Promise<AdminAlert[]> {
  const { session } = await getAuthContext();
  
  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access system alerts');
  }

  const alerts: AdminAlert[] = [];
  
  // Check for companies with low registration numbers
  const lowRegistrationCompanies = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM organization o
    LEFT JOIN (
      SELECT organization_id, COUNT(*) as player_count
      FROM player p
      JOIN event_year ey ON p.event_year_id = ey.id
      WHERE ey.year = EXTRACT(YEAR FROM NOW())
      GROUP BY organization_id
    ) pc ON o.id = pc.organization_id
    WHERE COALESCE(pc.player_count, 0) < 5
  `);

  const lowRegRow = (lowRegistrationCompanies as unknown as any[])[0];
  if (Number(lowRegRow?.count || 0) > 0) {
    alerts.push({
      id: 'low-registration-' + Date.now(),
      title: 'Low Registration Alert',
      description: `${lowRegRow.count} companies have fewer than 5 players registered`,
      type: 'warning',
      severity: 'warning',
      category: 'Registration',
      createdAt: new Date()
    });
  }

  // Add sample system alerts for demonstration
  if (alerts.length === 0) {
    alerts.push(
      {
        id: 'system-healthy-' + Date.now(),
        title: 'System Status: Healthy',
        description: 'All systems are operating normally',
        type: 'success',
        severity: 'info',
        category: 'System',
        createdAt: new Date()
      }
    );
  }

  return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}