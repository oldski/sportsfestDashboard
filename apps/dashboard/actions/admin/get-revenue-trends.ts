'use server';

import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getActiveEventYear } from './get-event-year';
import { db, eq, and, isNotNull } from '@workspace/database/client';
import { orderPaymentTable, orderTable, orderItemTable, productTable, PaymentStatus } from '@workspace/database/schema';

export interface RevenueTrendData {
  date: string;
  [productType: string]: number | string;
}

export interface ProductTypeData {
  type: string;
  color: string;
}

export interface RevenueStats {
  totalRevenue: number;
  revenueThisMonth: number;
}

export interface PaymentTrendData {
  date: string;
  [paymentType: string]: number | string;
}

export interface PaymentTypeData {
  type: string;
  color: string;
}

export type FrequencyType = 'daily' | 'weekly' | 'monthly';
export type RevenueProductType = ProductTypeData;

export async function getRevenueTrends(frequency: FrequencyType = 'daily'): Promise<{
  activeEvent: any;
  trends: RevenueTrendData[];
  productTypes: ProductTypeData[];
  paymentTrends: PaymentTrendData[];
  paymentTypes: PaymentTypeData[];
  stats: RevenueStats;
}> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access revenue trends');
  }

  try {
    const activeEvent = await getActiveEventYear();

    if (!activeEvent) {
      return {
        activeEvent: null,
        trends: [],
        productTypes: [],
        paymentTrends: [],
        paymentTypes: [],
        stats: {
          totalRevenue: 0,
          revenueThisMonth: 0
        }
      };
    }

    // Query payments for orders in the active event year, grouped by product type
    const paymentsData = await db
      .select({
        amount: orderPaymentTable.amount,
        processedAt: orderPaymentTable.processedAt,
        productType: productTable.type,
        paymentStatus: orderPaymentTable.status
      })
      .from(orderPaymentTable)
      .innerJoin(orderTable, eq(orderPaymentTable.orderId, orderTable.id))
      .innerJoin(orderItemTable, eq(orderItemTable.orderId, orderTable.id))
      .innerJoin(productTable, eq(orderItemTable.productId, productTable.id))
      .where(
        and(
          eq(orderTable.eventYearId, activeEvent.id),
          eq(orderPaymentTable.status, PaymentStatus.COMPLETED),
          isNotNull(orderPaymentTable.processedAt)
        )
      );


    // Query payments by payment type for the active event year
    const paymentTypeData = await db
      .select({
        amount: orderPaymentTable.amount,
        processedAt: orderPaymentTable.processedAt,
        paymentType: orderPaymentTable.type,
        paymentStatus: orderPaymentTable.status
      })
      .from(orderPaymentTable)
      .innerJoin(orderTable, eq(orderPaymentTable.orderId, orderTable.id))
      .where(
        and(
          eq(orderTable.eventYearId, activeEvent.id),
          eq(orderPaymentTable.status, PaymentStatus.COMPLETED),
          isNotNull(orderPaymentTable.processedAt)
        )
      );


    // Calculate stats
    const totalRevenue = paymentsData.reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate revenue for current month
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const revenueThisMonth = paymentsData
      .filter(payment => {
        if (!payment.processedAt) return false;
        const processedDate = new Date(payment.processedAt);
        return processedDate >= currentMonthStart && processedDate <= currentMonthEnd;
      })
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Process data by frequency and product type
    const processedData = processRevenueData(paymentsData, frequency, activeEvent);

    // Process payment type data
    const processedPaymentData = processPaymentData(paymentTypeData, frequency, activeEvent);

    // Get unique product types with colors
    const productTypes = getProductTypeColors(paymentsData);

    // Get unique payment types with colors
    const paymentTypes = getPaymentTypeColors(paymentTypeData);


    return {
      activeEvent,
      trends: processedData,
      productTypes,
      paymentTrends: processedPaymentData,
      paymentTypes,
      stats: {
        totalRevenue,
        revenueThisMonth
      }
    };
  } catch (error) {
    console.error('Error fetching revenue trends:', error);
    throw new Error('Failed to fetch revenue trends');
  }
}

function processRevenueData(payments: any[], frequency: 'daily' | 'weekly' | 'monthly', activeEvent: any): RevenueTrendData[] {
  const groupedData: Record<string, Record<string, number>> = {};

  // Get all unique product types
  const productTypes = [...new Set(payments.map(p => p.productType).filter(Boolean))];

  payments.forEach(payment => {
    if (!payment.processedAt) return;

    const date = new Date(payment.processedAt);
    let dateKey: string;

    switch (frequency) {
      case 'daily':
        dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case 'weekly':
        // Get Monday of the week
        const monday = new Date(date);
        monday.setDate(date.getDate() - date.getDay() + 1);
        dateKey = monday.toISOString().split('T')[0];
        break;
      case 'monthly':
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        dateKey = date.toISOString().split('T')[0];
    }

    if (!groupedData[dateKey]) {
      groupedData[dateKey] = {};
    }

    const productType = payment.productType || 'unknown';
    if (!groupedData[dateKey][productType]) {
      groupedData[dateKey][productType] = 0;
    }

    groupedData[dateKey][productType] += payment.amount;
  });

  // Fill in missing dates with zero values to create continuous timeline
  const filledData = fillMissingDates(groupedData, productTypes, frequency, activeEvent);

  // Convert to array format for Recharts
  return filledData
    .map(([date, productData]) => ({
      date,
      ...productData
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function fillMissingDates(
  groupedData: Record<string, Record<string, number>>,
  productTypes: string[],
  frequency: 'daily' | 'weekly' | 'monthly',
  activeEvent: any
): [string, Record<string, number>][] {
  // Use event start date as start, current date as end
  const startDate = activeEvent?.eventStartDate ? new Date(activeEvent.eventStartDate) : new Date();
  const endDate = new Date(); // Current date
  const filledData: [string, Record<string, number>][] = [];

  // If no event start date, fall back to payment dates
  if (!activeEvent?.eventStartDate) {
    const dates = Object.keys(groupedData).sort();
    if (dates.length === 0) return [];
    startDate.setTime(new Date(dates[0]).getTime());
  }

  const current = new Date(startDate);

  while (current <= endDate) {
    let dateKey: string;

    switch (frequency) {
      case 'daily':
        dateKey = current.toISOString().split('T')[0];
        current.setDate(current.getDate() + 1);
        break;
      case 'weekly':
        // Get Monday of the week
        const monday = new Date(current);
        monday.setDate(current.getDate() - current.getDay() + 1);
        dateKey = monday.toISOString().split('T')[0];
        current.setDate(current.getDate() + 7);
        break;
      case 'monthly':
        dateKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        current.setMonth(current.getMonth() + 1);
        break;
      default:
        dateKey = current.toISOString().split('T')[0];
        current.setDate(current.getDate() + 1);
    }

    // Initialize with zeros for all product types
    const productData: Record<string, number> = {};
    productTypes.forEach(type => {
      productData[type] = groupedData[dateKey]?.[type] || 0;
    });

    filledData.push([dateKey, productData]);
  }

  return filledData;
}

function getProductTypeColors(payments: any[]): ProductTypeData[] {
  const productTypes = [...new Set(payments.map(p => p.productType).filter(Boolean))];

  const colors = [
    'rgb(var(--chart-1))',
    'rgb(var(--chart-2))',
    'rgb(var(--chart-3))',
    'rgb(var(--chart-4))',
    'rgb(var(--chart-5))'
  ];

  return productTypes.map((type, index) => ({
    type,
    color: colors[index % colors.length]
  }));
}

function processPaymentData(payments: any[], frequency: 'daily' | 'weekly' | 'monthly', activeEvent: any): PaymentTrendData[] {
  const groupedData: Record<string, Record<string, number>> = {};

  // Get all unique payment types
  const paymentTypes = [...new Set(payments.map(p => p.paymentType).filter(Boolean))];

  payments.forEach(payment => {
    if (!payment.processedAt) return;

    const date = new Date(payment.processedAt);
    let dateKey: string;

    switch (frequency) {
      case 'daily':
        dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case 'weekly':
        // Get Monday of the week
        const monday = new Date(date);
        monday.setDate(date.getDate() - date.getDay() + 1);
        dateKey = monday.toISOString().split('T')[0];
        break;
      case 'monthly':
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        dateKey = date.toISOString().split('T')[0];
    }

    if (!groupedData[dateKey]) {
      groupedData[dateKey] = {};
    }

    const paymentType = payment.paymentType || 'unknown';
    if (!groupedData[dateKey][paymentType]) {
      groupedData[dateKey][paymentType] = 0;
    }

    groupedData[dateKey][paymentType] += payment.amount;
  });

  // Fill in missing dates with zero values to create continuous timeline
  const filledData = fillMissingPaymentDates(groupedData, paymentTypes, frequency, activeEvent);

  // Convert to array format for Recharts
  return filledData
    .map(([date, paymentData]) => ({
      date,
      ...paymentData
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function fillMissingPaymentDates(
  groupedData: Record<string, Record<string, number>>,
  paymentTypes: string[],
  frequency: 'daily' | 'weekly' | 'monthly',
  activeEvent: any
): [string, Record<string, number>][] {
  // Use event start date as start, current date as end
  const startDate = activeEvent?.eventStartDate ? new Date(activeEvent.eventStartDate) : new Date();
  const endDate = new Date(); // Current date
  const filledData: [string, Record<string, number>][] = [];

  // If no event start date, fall back to payment dates
  if (!activeEvent?.eventStartDate) {
    const dates = Object.keys(groupedData).sort();
    if (dates.length === 0) return [];
    startDate.setTime(new Date(dates[0]).getTime());
  }

  const current = new Date(startDate);

  while (current <= endDate) {
    let dateKey: string;

    switch (frequency) {
      case 'daily':
        dateKey = current.toISOString().split('T')[0];
        current.setDate(current.getDate() + 1);
        break;
      case 'weekly':
        // Get Monday of the week
        const monday = new Date(current);
        monday.setDate(current.getDate() - current.getDay() + 1);
        dateKey = monday.toISOString().split('T')[0];
        current.setDate(current.getDate() + 7);
        break;
      case 'monthly':
        dateKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        current.setMonth(current.getMonth() + 1);
        break;
      default:
        dateKey = current.toISOString().split('T')[0];
        current.setDate(current.getDate() + 1);
    }

    // Initialize with zeros for all payment types
    const paymentData: Record<string, number> = {};
    paymentTypes.forEach(type => {
      paymentData[type] = groupedData[dateKey]?.[type] || 0;
    });

    filledData.push([dateKey, paymentData]);
  }

  return filledData;
}

function getPaymentTypeColors(payments: any[]): PaymentTypeData[] {
  const paymentTypes = [...new Set(payments.map(p => p.paymentType).filter(Boolean))];

  const colors = [
    'rgb(var(--chart-1))',
    'rgb(var(--chart-2))',
    'rgb(var(--chart-3))',
    'rgb(var(--chart-4))',
    'rgb(var(--chart-5))'
  ];

  return paymentTypes.map((type, index) => ({
    type,
    color: colors[index % colors.length]
  }));
}