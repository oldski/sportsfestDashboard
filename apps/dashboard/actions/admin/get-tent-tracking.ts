'use server';

import { db, eq, desc, and, sum, count, sql } from '@workspace/database/client';
import { 
  tentPurchaseTrackingTable, 
  organizationTable, 
  eventYearTable,
  productTable,
  orderItemTable,
  orderTable
} from '@workspace/database/schema';
import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';

export type TentTrackingData = {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  eventYearId: string;
  eventYear: number;
  eventYearName: string;
  tentCount: number;
  maxAllowed: number;
  companyTeamCount: number;
  tentProductId: string;
  tentProductName: string;
  totalAmount: number;
  depositPaid: number;
  balanceOwed: number;
  status: 'confirmed' | 'pending_payment' | 'partial_payment' | 'cancelled';
  purchaseDate: string;
  createdAt: string;
  updatedAt: string;
  isAtLimit: boolean;
  orderNumber: string;
};

export type TentAvailabilityData = {
  eventYear: number;
  eventYearName: string;
  totalTents: number;
  purchasedTents: number;
  availableTents: number;
  utilizationRate: number;
  totalRevenue: number;
  organizationsAtLimit: number;
  pendingPayments: number;
};

export type ActiveEventYear = {
  id: string;
  year: number;
  name: string;
  isActive: boolean;
};

export async function getActiveEventYear(): Promise<ActiveEventYear | null> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access event year data');
  }

  try {
    const activeEventYear = await db
      .select({
        id: eventYearTable.id,
        year: eventYearTable.year,
        name: eventYearTable.name,
        isActive: eventYearTable.isActive,
      })
      .from(eventYearTable)
      .where(and(
        eq(eventYearTable.isActive, true),
        eq(eventYearTable.isDeleted, false)
      ))
      .limit(1);

    return activeEventYear[0] || null;
  } catch (error) {
    console.error('Error fetching active event year:', error);
    throw new Error('Failed to fetch active event year');
  }
}

export async function getTentTracking(eventYearId?: string): Promise<TentTrackingData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access tent tracking data');
  }

  try {
    // If no specific event year is provided, get the active one
    let targetEventYearId = eventYearId;
    if (!targetEventYearId) {
      const activeEventYear = await getActiveEventYear();
      if (!activeEventYear) {
        return [];
      }
      targetEventYearId = activeEventYear.id;
    }

    // First, check if the tent tracking table exists and has any records
    const tentTrackingExists = await db
      .select({ count: count() })
      .from(tentPurchaseTrackingTable)
      .where(eq(tentPurchaseTrackingTable.eventYearId, targetEventYearId));
    
    if (!tentTrackingExists[0] || tentTrackingExists[0].count === 0) {
      return [];
    }

    // Get the tent tracking data with joins
    const tentTrackingData = await db
      .select({
        id: tentPurchaseTrackingTable.id,
        organizationId: tentPurchaseTrackingTable.organizationId,
        organizationName: organizationTable.name,
        organizationSlug: organizationTable.slug,
        eventYearId: tentPurchaseTrackingTable.eventYearId,
        eventYear: eventYearTable.year,
        eventYearName: eventYearTable.name,
        tentCount: sql`COALESCE(${tentPurchaseTrackingTable.quantityPurchased}, 0)`.as('tentCount'),
        maxAllowed: tentPurchaseTrackingTable.maxAllowed,
        tentProductId: tentPurchaseTrackingTable.tentProductId,
        tentProductName: productTable.name,
        totalAmount: sql`COALESCE(${productTable.basePrice} * ${tentPurchaseTrackingTable.quantityPurchased}, 0)`.as('totalAmount'),
        depositPaid: sql`0`.as('depositPaid'),
        balanceOwed: sql`COALESCE(${productTable.basePrice} * ${tentPurchaseTrackingTable.quantityPurchased}, 0)`.as('balanceOwed'),
        status: sql`'pending'`.as('status'),
        purchaseDate: tentPurchaseTrackingTable.createdAt,
        createdAt: tentPurchaseTrackingTable.createdAt,
        updatedAt: tentPurchaseTrackingTable.updatedAt,
      })
      .from(tentPurchaseTrackingTable)
      .leftJoin(organizationTable, eq(tentPurchaseTrackingTable.organizationId, organizationTable.id))
      .leftJoin(eventYearTable, eq(tentPurchaseTrackingTable.eventYearId, eventYearTable.id))
      .leftJoin(productTable, eq(tentPurchaseTrackingTable.tentProductId, productTable.id))
      .where(eq(tentPurchaseTrackingTable.eventYearId, targetEventYearId))
      .orderBy(desc(tentPurchaseTrackingTable.createdAt));

    return tentTrackingData.map((item) => ({
      id: item.id,
      organizationId: item.organizationId,
      organizationName: item.organizationName || 'Unknown Organization',
      organizationSlug: item.organizationSlug || '',
      eventYearId: item.eventYearId,
      eventYear: item.eventYear || 0,
      eventYearName: item.eventYearName || 'Unknown Event',
      tentCount: Number(item.tentCount) || 0,
      maxAllowed: item.maxAllowed,
      tentProductId: item.tentProductId,
      tentProductName: item.tentProductName || 'Tent Rental',
      totalAmount: Number(item.totalAmount) || 0,
      depositPaid: Number(item.depositPaid) || 0,
      balanceOwed: Number(item.balanceOwed) || 0,
      status: item.status as 'confirmed' | 'pending_payment' | 'partial_payment' | 'cancelled',
      purchaseDate: item.purchaseDate.toISOString().split('T')[0],
      createdAt: item.createdAt.toISOString().split('T')[0],
      updatedAt: item.updatedAt.toISOString().split('T')[0],
      isAtLimit: Number(item.tentCount) >= item.maxAllowed,
      orderNumber: `TENT-${item.id.substring(0, 8).toUpperCase()}`, // Generate tent tracking reference
    }));
  } catch (error) {
    console.error('Error fetching tent tracking data:', error);
    // Return empty array instead of throwing to prevent page crashes
    return [];
  }
}

export async function getTentAvailability(eventYearId?: string): Promise<TentAvailabilityData | null> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access tent availability data');
  }

  try {
    // If no specific event year is provided, get the active one
    let targetEventYear: ActiveEventYear | null = null;
    
    if (!eventYearId) {
      targetEventYear = await getActiveEventYear();
      if (!targetEventYear) {
        return null;
      }
    } else {
      // Get event year info if ID was provided
      const eventYearResult = await db
        .select({
          id: eventYearTable.id,
          year: eventYearTable.year,
          name: eventYearTable.name,
          isActive: eventYearTable.isActive,
        })
        .from(eventYearTable)
        .where(eq(eventYearTable.id, eventYearId))
        .limit(1);
      
      targetEventYear = eventYearResult[0] || null;
      if (!targetEventYear) {
        return null;
      }
    }

    // Get tent tracking data to calculate summary
    const tentTrackingData = await getTentTracking(targetEventYear.id);
    
    // Calculate summary from the data
    const purchasedTents = tentTrackingData.reduce((sum, item) => sum + item.tentCount, 0);
    const organizationsAtLimit = tentTrackingData.filter(item => item.isAtLimit).length;
    const pendingPayments = tentTrackingData.filter(item => item.status === 'pending_payment').length;
    const totalRevenue = tentTrackingData.reduce((sum, item) => sum + item.totalAmount, 0);
    
    // TODO: Get the actual tent inventory limit from configuration
    // For now, we'll use a reasonable default
    const TOTAL_TENT_INVENTORY = 50; // This should come from configuration
    
    const availableTents = Math.max(0, TOTAL_TENT_INVENTORY - purchasedTents);
    const utilizationRate = TOTAL_TENT_INVENTORY > 0 
      ? Math.round((purchasedTents / TOTAL_TENT_INVENTORY) * 100) 
      : 0;

    return {
      eventYear: targetEventYear.year,
      eventYearName: targetEventYear.name,
      totalTents: TOTAL_TENT_INVENTORY,
      purchasedTents,
      availableTents,
      utilizationRate,
      totalRevenue,
      organizationsAtLimit,
      pendingPayments,
    };
  } catch (error) {
    console.error('Error fetching tent availability data:', error);
    // Return null instead of throwing to prevent page crashes
    return null;
  }
}