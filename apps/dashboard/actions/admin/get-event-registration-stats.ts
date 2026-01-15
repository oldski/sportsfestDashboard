'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { and, db, eq, ne, sql } from '@workspace/database/client';
import { productTable, orderTable, orderPaymentTable, tentPurchaseTrackingTable, eventYearTable, orderInvoiceTable, OrderStatus, ProductStatus } from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';

export interface EventRegistrationStats {
  // Product metrics (null if query failed)
  totalActiveProducts: number | null;
  productsAddedThisMonth: number | null;
  totalProductCategories: number | null;
  productsRequiringDeposits: number | null;

  // Revenue metrics (null if query failed)
  totalRevenue: number | null;
  revenueGrowthPercent: number | null;

  // Payment metrics (null if query failed)
  totalPendingPayments: number | null;
  pendingPaymentsCount: number | null;
  completedPaymentsCount: number | null;
  failedPaymentsCount: number | null;

  // Tent metrics (null if query failed)
  totalTentPurchases: number | null;
  tentQuotaMet: number | null;
  tentUtilizationPercent: number | null;
  availableTents: number | null;

  // Event Year metrics (null if query failed)
  currentEventYear: number | null;
  currentEventYearName: string | null;
  totalEventYears: number | null;
  hasActiveRegistrations: boolean | null;

  // Invoice metrics (null if query failed)
  outstandingInvoicesCount: number | null;
  paidInvoicesThisMonth: number | null;
  overdueInvoicesCount: number | null;

  // Error tracking for each section
  errors: {
    products: string | null;
    revenue: string | null;
    payments: string | null;
    tents: string | null;
    eventYears: string | null;
    invoices: string | null;
  };
}

export async function getEventRegistrationStats(): Promise<EventRegistrationStats> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access event registration statistics');
  }

  // Calculate first day of current month for monthly stats
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Initialize result with nulls
  const result: EventRegistrationStats = {
    totalActiveProducts: null,
    productsAddedThisMonth: null,
    totalProductCategories: null,
    productsRequiringDeposits: null,
    totalRevenue: null,
    revenueGrowthPercent: null,
    totalPendingPayments: null,
    pendingPaymentsCount: null,
    completedPaymentsCount: null,
    failedPaymentsCount: null,
    totalTentPurchases: null,
    tentQuotaMet: null,
    tentUtilizationPercent: null,
    availableTents: null,
    currentEventYear: null,
    currentEventYearName: null,
    totalEventYears: null,
    hasActiveRegistrations: null,
    outstandingInvoicesCount: null,
    paidInvoicesThisMonth: null,
    overdueInvoicesCount: null,
    errors: {
      products: null,
      revenue: null,
      payments: null,
      tents: null,
      eventYears: null,
      invoices: null
    }
  };

  // Get current active event year (needed for scoped queries)
  let currentEventYearId: string | undefined;
  try {
    const activeEventYear = await db
      .select()
      .from(eventYearTable)
      .where(eq(eventYearTable.isActive, true))
      .limit(1);

    currentEventYearId = activeEventYear[0]?.id;
    result.currentEventYear = activeEventYear[0]?.year || new Date().getFullYear();
    result.currentEventYearName = activeEventYear[0]?.name || `${new Date().getFullYear()}`;
  } catch (error) {
    console.error('Error fetching active event year:', error);
    result.errors.eventYears = 'Failed to fetch active event year';
  }

  // 1. Product Statistics
  try {
    const [productStats, productDetailsStats] = await Promise.all([
      db.select({
        totalActive: sql<number>`COUNT(*) FILTER (WHERE status = 'active')`,
        addedThisMonth: sql<number>`COUNT(*) FILTER (WHERE status = 'active' AND "createdAt" >= ${firstDayOfMonth.toISOString()})`
      })
      .from(productTable)
      .where(currentEventYearId ? eq(productTable.eventYearId, currentEventYearId) : sql`1=1`),

      db.select({
        totalCategories: sql<number>`COUNT(DISTINCT "categoryId")`,
        productsRequiringDeposits: sql<number>`COUNT(*) FILTER (WHERE "requiresDeposit" = true)`
      })
      .from(productTable)
      .where(and(
        eq(productTable.status, ProductStatus.ACTIVE),
        currentEventYearId ? eq(productTable.eventYearId, currentEventYearId) : sql`1=1`
      ))
    ]);

    const productRow = productStats[0] || { totalActive: 0, addedThisMonth: 0 };
    const productDetailsRow = productDetailsStats[0] || { totalCategories: 0, productsRequiringDeposits: 0 };

    result.totalActiveProducts = Number(productRow.totalActive);
    result.productsAddedThisMonth = Number(productRow.addedThisMonth);
    result.totalProductCategories = Number(productDetailsRow.totalCategories);
    result.productsRequiringDeposits = Number(productDetailsRow.productsRequiringDeposits);
  } catch (error) {
    console.error('Error fetching product stats:', error);
    result.errors.products = 'Failed to fetch product statistics';
  }

  // 2. Revenue Statistics
  try {
    const revenueStats = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM("totalAmount"), 0)`,
        revenueThisMonth: sql<number>`COALESCE(SUM("totalAmount") FILTER (WHERE "createdAt" >= ${firstDayOfMonth.toISOString()}), 0)`,
        revenueLastMonth: sql<number>`COALESCE(SUM("totalAmount") FILTER (WHERE "createdAt" >= ${firstDayLastMonth.toISOString()} AND "createdAt" < ${firstDayOfMonth.toISOString()}), 0)`
      })
      .from(orderTable)
      .where(and(
        ne(orderTable.status, OrderStatus.CANCELLED),
        currentEventYearId ? eq(orderTable.eventYearId, currentEventYearId) : sql`1=1`
      ));

    const revenueRow = revenueStats[0] || { totalRevenue: 0, revenueThisMonth: 0, revenueLastMonth: 0 };
    const thisMonthRevenue = Number(revenueRow.revenueThisMonth);
    const lastMonthRevenue = Number(revenueRow.revenueLastMonth);

    result.totalRevenue = Number(revenueRow.totalRevenue);
    result.revenueGrowthPercent = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    result.errors.revenue = 'Failed to fetch revenue statistics';
  }

  // 3. Payment Statistics
  try {
    const [pendingPaymentStats, paymentStatusStats] = await Promise.all([
      db.select({
        totalPendingAmount: sql<number>`COALESCE(SUM(${orderTable.totalAmount} - COALESCE(paid_amounts.paid, 0)), 0)`,
        pendingCount: sql<number>`COUNT(*)`
      })
      .from(orderTable)
      .leftJoin(
        sql`(
          SELECT
            "orderId",
            COALESCE(SUM("amount"), 0) as paid
          FROM ${orderPaymentTable}
          WHERE "status" = 'completed'
          GROUP BY "orderId"
        ) as paid_amounts`,
        sql`paid_amounts."orderId" = ${orderTable.id}`
      )
      .where(and(
        sql`(${orderTable.totalAmount} - COALESCE(paid_amounts.paid, 0)) > 0`,
        ne(orderTable.status, OrderStatus.CANCELLED),
        currentEventYearId ? eq(orderTable.eventYearId, currentEventYearId) : sql`1=1`
      )),

      db.select({
        completedCount: sql<number>`COUNT(*) FILTER (WHERE "status" = 'completed')`,
        failedCount: sql<number>`COUNT(*) FILTER (WHERE "status" = 'failed')`
      })
      .from(orderPaymentTable)
      .where(currentEventYearId ? sql`EXISTS (
        SELECT 1 FROM ${orderTable}
        WHERE ${orderTable.id} = ${orderPaymentTable.orderId}
        AND ${orderTable.eventYearId} = ${currentEventYearId}
      )` : sql`1=1`)
    ]);

    const pendingRow = pendingPaymentStats[0] || { totalPendingAmount: 0, pendingCount: 0 };
    const paymentStatusRow = paymentStatusStats[0] || { completedCount: 0, failedCount: 0 };

    result.totalPendingPayments = Number(pendingRow.totalPendingAmount);
    result.pendingPaymentsCount = Number(pendingRow.pendingCount);
    result.completedPaymentsCount = Number(paymentStatusRow.completedCount);
    result.failedPaymentsCount = Number(paymentStatusRow.failedCount);
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    result.errors.payments = 'Failed to fetch payment statistics';
  }

  // 4. Tent Statistics
  try {
    const tentStats = await db
      .select({
        totalPurchases: sql<number>`COUNT(*)`,
        // Orgs at quota: where tents purchased >= companyTeamCount * 2 (2 tents per team)
        quotaMet: sql<number>`COUNT(*) FILTER (WHERE "quantityPurchased" >= "companyTeamCount" * 2)`,
        totalQuantityPurchased: sql<number>`COALESCE(SUM("quantityPurchased"), 0)`
      })
      .from(tentPurchaseTrackingTable)
      .where(currentEventYearId ? eq(tentPurchaseTrackingTable.eventYearId, currentEventYearId) : sql`1=1`);

    const tentRow = tentStats[0] || { totalPurchases: 0, quotaMet: 0, totalQuantityPurchased: 0 };
    const totalOrgsWithTents = Number(tentRow.totalPurchases);
    const orgsAtQuota = Number(tentRow.quotaMet);

    result.totalTentPurchases = totalOrgsWithTents;
    result.tentQuotaMet = orgsAtQuota;
    result.tentUtilizationPercent = totalOrgsWithTents > 0
      ? Math.round((orgsAtQuota / totalOrgsWithTents) * 100)
      : 0;
    result.availableTents = Math.max(0, Number(tentRow.totalQuantityPurchased) - totalOrgsWithTents);
  } catch (error) {
    console.error('Error fetching tent stats:', error);
    result.errors.tents = 'Failed to fetch tent statistics';
  }

  // 5. Event Year Statistics
  try {
    const eventYearStats = await db
      .select({
        totalEventYears: sql<number>`COUNT(*)`,
        hasActiveRegistrations: sql<boolean>`EXISTS (SELECT 1 FROM ${orderTable} WHERE "status" != 'cancelled')`
      })
      .from(eventYearTable);

    const eventYearRow = eventYearStats[0] || { totalEventYears: 0, hasActiveRegistrations: false };

    result.totalEventYears = Number(eventYearRow.totalEventYears);
    result.hasActiveRegistrations = Boolean(eventYearRow.hasActiveRegistrations);
  } catch (error) {
    console.error('Error fetching event year stats:', error);
    result.errors.eventYears = result.errors.eventYears || 'Failed to fetch event year statistics';
  }

  // 6. Invoice Statistics
  try {
    const invoiceStats = await db
      .select({
        outstandingCount: sql<number>`COUNT(*) FILTER (WHERE "status" = 'outstanding')`,
        paidThisMonth: sql<number>`COUNT(*) FILTER (WHERE "status" = 'paid' AND "paidAt" >= ${firstDayOfMonth.toISOString()})`,
        overdueCount: sql<number>`COUNT(*) FILTER (WHERE "status" = 'overdue')`
      })
      .from(orderInvoiceTable)
      .where(currentEventYearId ? sql`EXISTS (
        SELECT 1 FROM ${orderTable}
        WHERE ${orderTable.id} = ${orderInvoiceTable.orderId}
        AND ${orderTable.eventYearId} = ${currentEventYearId}
      )` : sql`1=1`);

    const invoiceRow = invoiceStats[0] || { outstandingCount: 0, paidThisMonth: 0, overdueCount: 0 };

    result.outstandingInvoicesCount = Number(invoiceRow.outstandingCount);
    result.paidInvoicesThisMonth = Number(invoiceRow.paidThisMonth);
    result.overdueInvoicesCount = Number(invoiceRow.overdueCount);
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    result.errors.invoices = 'Failed to fetch invoice statistics';
  }

  return result;
}
