'use server';

import { db, eq, and, inArray, sql, or, like } from '@workspace/database/client';
import {
  companyTeamTable,
  organizationTable,
  orderTable,
  orderItemTable,
  productTable,
  OrderStatus,
} from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';

export type CompanyTeamPaymentStatus = 'fully_paid' | 'deposit_paid' | 'unpaid';

export type CompanyTeamRow = {
  id: string;
  organizationId: string;
  companyName: string;
  teamNumber: number;
  teamName: string | null;
  isPaid: boolean;
  paymentStatus: CompanyTeamPaymentStatus;
  createdAt: Date | null;
};

export type CompanyTeamsReportData = {
  totalTeams: number;
  totalFullyPaid: number;
  totalDepositPaid: number;
  totalUnpaid: number;
  rows: CompanyTeamRow[];
};

export async function getCompanyTeamsReport(eventYearId?: string): Promise<CompanyTeamsReportData> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access this data');
  }

  try {
    let targetEventYearId = eventYearId;
    if (!targetEventYearId) {
      const currentEventYear = await getCurrentEventYear();
      targetEventYearId = currentEventYear?.id as string | undefined;
    }

    if (!targetEventYearId) {
      return { totalTeams: 0, totalFullyPaid: 0, totalDepositPaid: 0, totalUnpaid: 0, rows: [] };
    }

    // Get teams
    const teams = await db
      .select({
        id: companyTeamTable.id,
        organizationId: companyTeamTable.organizationId,
        companyName: organizationTable.name,
        teamNumber: companyTeamTable.teamNumber,
        teamName: companyTeamTable.name,
        isPaid: companyTeamTable.isPaid,
        createdAt: companyTeamTable.createdAt,
      })
      .from(companyTeamTable)
      .innerJoin(organizationTable, eq(companyTeamTable.organizationId, organizationTable.id))
      .where(eq(companyTeamTable.eventYearId, targetEventYearId))
      .orderBy(organizationTable.name, companyTeamTable.teamNumber);

    // Get the payment status per organization from orders that contain team products only
    // This avoids tent-only or other non-team orders from influencing the status
    const orgOrderStatuses = await db
      .select({
        organizationId: orderTable.organizationId,
        hasFullyPaid: sql<boolean>`BOOL_OR(${orderTable.status} = ${OrderStatus.FULLY_PAID})`,
        hasDepositPaid: sql<boolean>`BOOL_OR(${orderTable.status} = ${OrderStatus.DEPOSIT_PAID})`,
      })
      .from(orderTable)
      .innerJoin(orderItemTable, eq(orderItemTable.orderId, orderTable.id))
      .innerJoin(productTable, eq(orderItemTable.productId, productTable.id))
      .where(
        and(
          eq(orderTable.eventYearId, targetEventYearId),
          inArray(orderTable.status, [OrderStatus.FULLY_PAID, OrderStatus.DEPOSIT_PAID]),
          eq(orderTable.isSponsorship, false),
          or(
            like(sql`LOWER(${productTable.name})`, '%team%'),
            like(sql`LOWER(${productTable.name})`, '%company team%')
          )
        )
      )
      .groupBy(orderTable.organizationId);

    const orgStatusMap = new Map(
      orgOrderStatuses.map(o => [o.organizationId, {
        hasFullyPaid: o.hasFullyPaid,
        hasDepositPaid: o.hasDepositPaid,
      }])
    );

    // Enrich teams with payment status
    const rows: CompanyTeamRow[] = teams.map(team => {
      let paymentStatus: CompanyTeamPaymentStatus = 'unpaid';
      if (team.isPaid) {
        const orgStatus = orgStatusMap.get(team.organizationId);
        if (orgStatus?.hasFullyPaid) {
          paymentStatus = 'fully_paid';
        } else if (orgStatus?.hasDepositPaid) {
          paymentStatus = 'deposit_paid';
        } else {
          // isPaid is true but no matching order found — treat as deposit
          paymentStatus = 'deposit_paid';
        }
      }
      return { ...team, paymentStatus };
    });

    const totalTeams = rows.length;
    const totalFullyPaid = rows.filter(t => t.paymentStatus === 'fully_paid').length;
    const totalDepositPaid = rows.filter(t => t.paymentStatus === 'deposit_paid').length;
    const totalUnpaid = rows.filter(t => t.paymentStatus === 'unpaid').length;

    return {
      totalTeams,
      totalFullyPaid,
      totalDepositPaid,
      totalUnpaid,
      rows,
    };
  } catch (error) {
    console.error('Failed to get company teams report:', error);
    return { totalTeams: 0, totalFullyPaid: 0, totalDepositPaid: 0, totalUnpaid: 0, rows: [] };
  }
}
