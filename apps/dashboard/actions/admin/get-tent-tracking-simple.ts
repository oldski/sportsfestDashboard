'use server';

import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getActiveEventYear } from './get-tent-tracking';
import type { TentTrackingData, TentAvailabilityData } from './get-tent-tracking';

// Temporary mock data until the tent tracking table is properly set up
const mockTentPurchases: TentTrackingData[] = [
  {
    id: '1',
    organizationId: 'org-1',
    organizationName: 'Acme Corporation',
    organizationSlug: 'acme-corp',
    eventYearId: 'event-2025',
    eventYear: 2025,
    eventYearName: 'SportsFest 2025',
    tentCount: 2,
    maxAllowed: 2,
    tentProductId: 'tent-product-1',
    tentProductName: 'Standard Tent Rental',
    totalAmount: 400.00,
    depositPaid: 150.00,
    balanceOwed: 250.00,
    status: 'confirmed',
    purchaseDate: '2025-01-15',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-15',
    isAtLimit: true,
  },
  {
    id: '2',
    organizationId: 'org-2',
    organizationName: 'TechStart Innovations',
    organizationSlug: 'techstart',
    eventYearId: 'event-2025',
    eventYear: 2025,
    eventYearName: 'SportsFest 2025',
    tentCount: 1,
    maxAllowed: 2,
    tentProductId: 'tent-product-1',
    tentProductName: 'Standard Tent Rental',
    totalAmount: 200.00,
    depositPaid: 75.00,
    balanceOwed: 125.00,
    status: 'confirmed',
    purchaseDate: '2025-01-12',
    createdAt: '2025-01-12',
    updatedAt: '2025-01-12',
    isAtLimit: false,
  },
  {
    id: '3',
    organizationId: 'org-3',
    organizationName: 'Global Solutions Inc',
    organizationSlug: 'global-solutions',
    eventYearId: 'event-2025',
    eventYear: 2025,
    eventYearName: 'SportsFest 2025',
    tentCount: 2,
    maxAllowed: 2,
    tentProductId: 'tent-product-1',
    tentProductName: 'Standard Tent Rental',
    totalAmount: 400.00,
    depositPaid: 0,
    balanceOwed: 400.00,
    status: 'pending_payment',
    purchaseDate: '2025-01-10',
    createdAt: '2025-01-10',
    updatedAt: '2025-01-10',
    isAtLimit: true,
  },
  {
    id: '4',
    organizationId: 'org-4',
    organizationName: 'BlueSky Enterprises',
    organizationSlug: 'bluesky',
    eventYearId: 'event-2025',
    eventYear: 2025,
    eventYearName: 'SportsFest 2025',
    tentCount: 1,
    maxAllowed: 2,
    tentProductId: 'tent-product-1',
    tentProductName: 'Standard Tent Rental',
    totalAmount: 200.00,
    depositPaid: 200.00,
    balanceOwed: 0,
    status: 'confirmed',
    purchaseDate: '2025-01-08',
    createdAt: '2025-01-08',
    updatedAt: '2025-01-08',
    isAtLimit: false,
  }
];

export async function getTentTrackingSimple(): Promise<TentTrackingData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access tent tracking data');
  }

  // For now, return mock data
  // TODO: Replace with actual database query when tent tracking table is ready
  return mockTentPurchases;
}

export async function getTentAvailabilitySimple(): Promise<TentAvailabilityData | null> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access tent availability data');
  }

  try {
    // Get the active event year for display
    const activeEventYear = await getActiveEventYear();
    if (!activeEventYear) {
      return null;
    }

    // Calculate from mock data
    const purchasedTents = mockTentPurchases.reduce((sum, item) => sum + item.tentCount, 0);
    const organizationsAtLimit = mockTentPurchases.filter(item => item.isAtLimit).length;
    const pendingPayments = mockTentPurchases.filter(item => item.status === 'pending_payment').length;
    const totalRevenue = mockTentPurchases.reduce((sum, item) => sum + item.totalAmount, 0);
    
    const TOTAL_TENT_INVENTORY = 50;
    const availableTents = Math.max(0, TOTAL_TENT_INVENTORY - purchasedTents);
    const utilizationRate = TOTAL_TENT_INVENTORY > 0 
      ? Math.round((purchasedTents / TOTAL_TENT_INVENTORY) * 100) 
      : 0;

    return {
      eventYear: activeEventYear.year,
      eventYearName: activeEventYear.name,
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
    return null;
  }
}