'use server';

import { auth } from '@workspace/auth';
import { db, eq, and, desc } from '@workspace/database/client';
import { couponTable, eventYearTable, organizationTable } from '@workspace/database/schema';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';

export type CouponData = {
  id: string;
  code: string;
  eventYearId: string;
  eventYear: number;
  eventYearName: string;
  registrationClose: string; // Event year registration close date
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  organizationRestriction: 'anyone' | 'specific';
  restrictedOrganizations?: string[]; // Organization IDs
  restrictedOrganizationNames?: string[]; // For display
  maxUses: number;
  currentUses: number;
  minimumOrderAmount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
};

export async function getAllCouponsSimple(): Promise<CouponData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access coupon data');
  }

  try {
    const currentEventYear = await getCurrentEventYear();
    if (!currentEventYear) {
      console.log('No active event year found, returning empty array');
      return [];
    }

    console.log('Attempting to query coupons for event year:', currentEventYear.id);

    const result = await db
      .select({
        id: couponTable.id,
        code: couponTable.code,
        eventYearId: couponTable.eventYearId,
        eventYear: eventYearTable.year,
        eventYearName: eventYearTable.name,
        registrationClose: eventYearTable.registrationClose,
        discountType: couponTable.discountType,
        discountValue: couponTable.discountValue,
        organizationRestriction: couponTable.organizationRestriction,
        restrictedOrganizations: couponTable.restrictedOrganizations,
        maxUses: couponTable.maxUses,
        currentUses: couponTable.currentUses,
        minimumOrderAmount: couponTable.minimumOrderAmount,
        isActive: couponTable.isActive,
        expiresAt: couponTable.expiresAt,
        createdAt: couponTable.createdAt,
        updatedAt: couponTable.updatedAt,
      })
      .from(couponTable)
      .innerJoin(eventYearTable, eq(couponTable.eventYearId, eventYearTable.id))
      .where(eq(couponTable.eventYearId, currentEventYear.id as string))
      .orderBy(desc(couponTable.createdAt));

    console.log('Query executed successfully, found', result.length, 'records');

    // If any coupons have organization restrictions, fetch organization names
    const organizationIds = new Set<string>();
    result.forEach(coupon => {
      if (coupon.organizationRestriction === 'specific' && coupon.restrictedOrganizations) {
        const orgIds = Array.isArray(coupon.restrictedOrganizations)
          ? coupon.restrictedOrganizations
          : [];
        orgIds.forEach(id => organizationIds.add(id));
      }
    });

    let organizationNames: Map<string, string> = new Map();
    if (organizationIds.size > 0) {
      const orgs = await db
        .select({
          id: organizationTable.id,
          name: organizationTable.name,
        })
        .from(organizationTable)
        .where(eq(organizationTable.id, Array.from(organizationIds)[0])); // This needs to be improved for multiple IDs

      orgs.forEach(org => {
        organizationNames.set(org.id, org.name);
      });
    }

    return result.map(row => ({
      id: row.id,
      code: row.code,
      eventYearId: row.eventYearId,
      eventYear: row.eventYear,
      eventYearName: row.eventYearName,
      registrationClose: (() => {
        const date = row.registrationClose;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })(),
      discountType: row.discountType as 'percentage' | 'fixed_amount',
      discountValue: row.discountValue,
      organizationRestriction: row.organizationRestriction as 'anyone' | 'specific',
      restrictedOrganizations: row.organizationRestriction === 'specific' && row.restrictedOrganizations
        ? (Array.isArray(row.restrictedOrganizations) ? row.restrictedOrganizations : [])
        : undefined,
      restrictedOrganizationNames: row.organizationRestriction === 'specific' && row.restrictedOrganizations
        ? (Array.isArray(row.restrictedOrganizations) ? row.restrictedOrganizations : [])
            .map(id => organizationNames.get(id) || 'Unknown')
        : undefined,
      maxUses: row.maxUses,
      currentUses: row.currentUses,
      minimumOrderAmount: row.minimumOrderAmount,
      isActive: row.isActive,
      expiresAt: row.expiresAt ? (() => {
        const date = row.expiresAt;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })() : undefined,
      createdAt: (() => {
        const date = row.createdAt;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })(),
      updatedAt: (() => {
        const date = row.updatedAt;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })(),
    }));
  } catch (error) {
    console.error('Error fetching coupons:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

export async function getActiveCouponsSimple(): Promise<CouponData[]> {
  const allCoupons = await getAllCouponsSimple();
  const now = new Date();

  return allCoupons.filter(coupon =>
    coupon.isActive &&
    coupon.currentUses < coupon.maxUses &&
    (!coupon.expiresAt || new Date(coupon.expiresAt) > now)
  );
}

export async function getExpiredCouponsSimple(): Promise<CouponData[]> {
  const allCoupons = await getAllCouponsSimple();
  const now = new Date();

  return allCoupons.filter(coupon =>
    coupon.expiresAt && new Date(coupon.expiresAt) <= now
  );
}

export async function getUsedCouponsSimple(): Promise<CouponData[]> {
  const allCoupons = await getAllCouponsSimple();

  return allCoupons.filter(coupon =>
    coupon.currentUses >= coupon.maxUses
  );
}