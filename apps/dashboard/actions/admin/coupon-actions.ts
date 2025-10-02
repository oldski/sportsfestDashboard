'use server';

import { auth } from '@workspace/auth';
import { db, eq, and, ne } from '@workspace/database/client';
import { couponTable, eventYearTable } from '@workspace/database/schema';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Validation schema for coupon creation/updates
const couponSchema = z.object({
  code: z
    .string()
    .min(3, 'Coupon code must be at least 3 characters')
    .max(50, 'Coupon code must be less than 50 characters')
    .regex(/^[A-Z0-9-_]+$/, 'Coupon code can only contain uppercase letters, numbers, hyphens, and underscores'),
  discountType: z.enum(['percentage', 'fixed_amount']),
  discountValue: z.number().min(0.01, 'Discount value must be greater than 0'),
  organizationRestriction: z.enum(['anyone', 'specific']),
  restrictedOrganizations: z.array(z.string()).optional(),
  maxUses: z.number().int().min(1, 'Max uses must be at least 1'),
  minimumOrderAmount: z.number().min(0, 'Minimum order amount must be 0 or greater'),
  expiresAt: z.string().optional().nullable()
});

type CouponFormData = z.infer<typeof couponSchema>;

export type { CouponFormData };

export type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Create a new coupon
 */
export async function createCoupon(formData: CouponFormData): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!isSuperAdmin(session.user)) {
      return { success: false, error: 'Unauthorized: Only super admins can create coupons' };
    }

    // Validate input data
    const validatedData = couponSchema.parse(formData);

    // Get current event year
    const currentEventYear = await getCurrentEventYear();
    if (!currentEventYear) {
      return { success: false, error: 'No active event year found' };
    }

    // Check if coupon code already exists
    const existingCoupon = await db
      .select({ id: couponTable.id })
      .from(couponTable)
      .where(eq(couponTable.code, validatedData.code))
      .limit(1);

    if (existingCoupon.length > 0) {
      return { success: false, error: 'Coupon code already exists' };
    }

    // Validate percentage discount
    if (validatedData.discountType === 'percentage' && validatedData.discountValue > 100) {
      return { success: false, error: 'Percentage discount cannot exceed 100%' };
    }

    // Parse expiration date
    let expiresAt: Date | null = null;
    if (validatedData.expiresAt) {
      expiresAt = new Date(validatedData.expiresAt);
      if (isNaN(expiresAt.getTime())) {
        return { success: false, error: 'Invalid expiration date' };
      }
    }

    // Create the coupon
    const newCoupon = await db
      .insert(couponTable)
      .values({
        code: validatedData.code,
        eventYearId: currentEventYear.id as string,
        discountType: validatedData.discountType,
        discountValue: validatedData.discountValue,
        organizationRestriction: validatedData.organizationRestriction,
        restrictedOrganizations: validatedData.organizationRestriction === 'specific'
          ? validatedData.restrictedOrganizations || []
          : null,
        maxUses: validatedData.maxUses,
        currentUses: 0,
        minimumOrderAmount: validatedData.minimumOrderAmount,
        isActive: true,
        expiresAt: expiresAt,
      })
      .returning();

    // Revalidate the coupons page
    revalidatePath('/admin/event-registration/coupons');

    return {
      success: true,
      data: newCoupon[0],
      error: undefined
    };

  } catch (error) {
    console.error('Error creating coupon:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => e.message).join(', ')
      };
    }

    return {
      success: false,
      error: 'Failed to create coupon. Please try again.'
    };
  }
}

/**
 * Update an existing coupon
 */
export async function updateCoupon(couponId: string, formData: Partial<CouponFormData>): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!isSuperAdmin(session.user)) {
      return { success: false, error: 'Unauthorized: Only super admins can update coupons' };
    }

    // Check if coupon exists
    const existingCoupon = await db
      .select()
      .from(couponTable)
      .where(eq(couponTable.id, couponId))
      .limit(1);

    if (existingCoupon.length === 0) {
      return { success: false, error: 'Coupon not found' };
    }

    // Prepare update data
    const updateData: any = {};

    if (formData.code !== undefined) {
      // Check if new code conflicts with existing codes (excluding current coupon)
      const codeConflict = await db
        .select({ id: couponTable.id })
        .from(couponTable)
        .where(and(
          eq(couponTable.code, formData.code),
          ne(couponTable.id, couponId) // NOT equal to current coupon
        ))
        .limit(1);

      if (codeConflict.length > 0) {
        return { success: false, error: 'Coupon code already exists' };
      }

      updateData.code = formData.code;
    }

    if (formData.discountType !== undefined) updateData.discountType = formData.discountType;
    if (formData.discountValue !== undefined) {
      if (formData.discountType === 'percentage' && formData.discountValue > 100) {
        return { success: false, error: 'Percentage discount cannot exceed 100%' };
      }
      updateData.discountValue = formData.discountValue;
    }

    if (formData.organizationRestriction !== undefined) {
      updateData.organizationRestriction = formData.organizationRestriction;
      updateData.restrictedOrganizations = formData.organizationRestriction === 'specific'
        ? formData.restrictedOrganizations || []
        : null;
    }

    if (formData.maxUses !== undefined) updateData.maxUses = formData.maxUses;
    if (formData.minimumOrderAmount !== undefined) updateData.minimumOrderAmount = formData.minimumOrderAmount;

    if (formData.expiresAt !== undefined) {
      if (formData.expiresAt) {
        const expiresAt = new Date(formData.expiresAt);
        if (isNaN(expiresAt.getTime())) {
          return { success: false, error: 'Invalid expiration date' };
        }
        updateData.expiresAt = expiresAt;
      } else {
        updateData.expiresAt = null;
      }
    }

    // Check if there's actually something to update
    if (Object.keys(updateData).length === 0) {
      return { success: false, error: 'No fields to update' };
    }

    console.log('Update data:', updateData);

    // Update the coupon
    const updatedCoupon = await db
      .update(couponTable)
      .set(updateData)
      .where(eq(couponTable.id, couponId))
      .returning();

    // Revalidate the coupons page
    revalidatePath('/admin/event-registration/coupons');

    return {
      success: true,
      data: updatedCoupon[0]
    };

  } catch (error) {
    console.error('Error updating coupon:', error);
    return {
      success: false,
      error: 'Failed to update coupon. Please try again.'
    };
  }
}

/**
 * Toggle coupon active status
 */
export async function toggleCouponStatus(couponId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!isSuperAdmin(session.user)) {
      return { success: false, error: 'Unauthorized: Only super admins can toggle coupon status' };
    }

    // Get current coupon
    const existingCoupon = await db
      .select({ isActive: couponTable.isActive })
      .from(couponTable)
      .where(eq(couponTable.id, couponId))
      .limit(1);

    if (existingCoupon.length === 0) {
      return { success: false, error: 'Coupon not found' };
    }

    // Toggle the status
    const newStatus = !existingCoupon[0].isActive;

    const updatedCoupon = await db
      .update(couponTable)
      .set({ isActive: newStatus })
      .where(eq(couponTable.id, couponId))
      .returning();

    // Revalidate the coupons page
    revalidatePath('/admin/event-registration/coupons');

    return {
      success: true,
      data: { isActive: newStatus }
    };

  } catch (error) {
    console.error('Error toggling coupon status:', error);
    return {
      success: false,
      error: 'Failed to toggle coupon status. Please try again.'
    };
  }
}

/**
 * Delete a coupon
 */
export async function deleteCoupon(couponId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!isSuperAdmin(session.user)) {
      return { success: false, error: 'Unauthorized: Only super admins can delete coupons' };
    }

    // Check if coupon exists and has been used
    const existingCoupon = await db
      .select({ currentUses: couponTable.currentUses })
      .from(couponTable)
      .where(eq(couponTable.id, couponId))
      .limit(1);

    if (existingCoupon.length === 0) {
      return { success: false, error: 'Coupon not found' };
    }

    // Prevent deletion of used coupons for audit trail
    if (existingCoupon[0].currentUses > 0) {
      return {
        success: false,
        error: 'Cannot delete coupon that has been used. Disable it instead.'
      };
    }

    // Delete the coupon
    await db
      .delete(couponTable)
      .where(eq(couponTable.id, couponId));

    // Revalidate the coupons page
    revalidatePath('/admin/event-registration/coupons');

    return { success: true };

  } catch (error) {
    console.error('Error deleting coupon:', error);
    return {
      success: false,
      error: 'Failed to delete coupon. Please try again.'
    };
  }
}

/**
 * Validate a coupon code for checkout
 */
export async function validateCouponCode(
  code: string,
  organizationId: string,
  orderTotal: number
): Promise<ActionResult<{
  id: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  calculatedDiscount: number;
}>> {
  try {
    // Get current event year
    const currentEventYear = await getCurrentEventYear();
    if (!currentEventYear) {
      return { success: false, error: 'No active event year found' };
    }

    // Find the coupon
    const coupon = await db
      .select({
        id: couponTable.id,
        discountType: couponTable.discountType,
        discountValue: couponTable.discountValue,
        organizationRestriction: couponTable.organizationRestriction,
        restrictedOrganizations: couponTable.restrictedOrganizations,
        maxUses: couponTable.maxUses,
        currentUses: couponTable.currentUses,
        minimumOrderAmount: couponTable.minimumOrderAmount,
        isActive: couponTable.isActive,
        expiresAt: couponTable.expiresAt,
      })
      .from(couponTable)
      .where(and(
        eq(couponTable.code, code.toUpperCase()),
        eq(couponTable.eventYearId, currentEventYear.id as string)
      ))
      .limit(1);

    if (coupon.length === 0) {
      return { success: false, error: 'Invalid coupon code' };
    }

    const couponData = coupon[0];

    // Validate coupon status
    if (!couponData.isActive) {
      return { success: false, error: 'This coupon is no longer active' };
    }

    // Check usage limits
    if (couponData.currentUses >= couponData.maxUses) {
      return { success: false, error: 'This coupon has reached its usage limit' };
    }

    // Check expiration
    if (couponData.expiresAt && new Date(couponData.expiresAt) <= new Date()) {
      return { success: false, error: 'This coupon has expired' };
    }

    // Check minimum order amount
    if (orderTotal < couponData.minimumOrderAmount) {
      return {
        success: false,
        error: `Minimum order amount of $${couponData.minimumOrderAmount.toFixed(2)} required for this coupon`
      };
    }

    // Check organization restriction
    if (couponData.organizationRestriction === 'specific') {
      const restrictedOrgs = Array.isArray(couponData.restrictedOrganizations)
        ? couponData.restrictedOrganizations
        : [];

      if (!restrictedOrgs.includes(organizationId)) {
        return { success: false, error: 'This coupon is not available for your organization' };
      }
    }

    // Calculate discount
    let calculatedDiscount = 0;
    if (couponData.discountType === 'percentage') {
      calculatedDiscount = (orderTotal * couponData.discountValue) / 100;
    } else {
      calculatedDiscount = Math.min(couponData.discountValue, orderTotal);
    }

    return {
      success: true,
      data: {
        id: couponData.id,
        discountType: couponData.discountType as 'percentage' | 'fixed_amount',
        discountValue: couponData.discountValue,
        calculatedDiscount: calculatedDiscount
      }
    };

  } catch (error) {
    console.error('Error validating coupon:', error);
    return {
      success: false,
      error: 'Failed to validate coupon. Please try again.'
    };
  }
}

/**
 * Get a single coupon by ID for editing
 */
export async function getCouponById(couponId: string): Promise<ActionResult<CouponFormData | null>> {
  console.log('getCouponById called with ID:', couponId);

  try {
    const session = await auth();
    if (!session?.user) {
      console.log('getCouponById: No session');
      return { success: false, error: 'Unauthorized' };
    }

    if (!isSuperAdmin(session.user)) {
      console.log('getCouponById: Not super admin');
      return { success: false, error: 'Unauthorized: Only super admins can view coupons' };
    }

    console.log('getCouponById: Querying database for coupon:', couponId);

    const coupon = await db
      .select({
        id: couponTable.id,
        code: couponTable.code,
        discountType: couponTable.discountType,
        discountValue: couponTable.discountValue,
        organizationRestriction: couponTable.organizationRestriction,
        restrictedOrganizations: couponTable.restrictedOrganizations,
        maxUses: couponTable.maxUses,
        minimumOrderAmount: couponTable.minimumOrderAmount,
        expiresAt: couponTable.expiresAt
      })
      .from(couponTable)
      .where(eq(couponTable.id, couponId))
      .limit(1);

    console.log('getCouponById: Database query result:', coupon);

    if (coupon.length === 0) {
      console.log('getCouponById: Coupon not found');
      return { success: false, error: 'Coupon not found' };
    }

    const couponData = coupon[0];
    console.log('getCouponById: Raw coupon data:', JSON.stringify(couponData, null, 2));

    // Transform the data to match the form schema
    console.log('getCouponById: About to transform data...');

    let expiresAtFormatted = '';
    try {
      if (couponData.expiresAt) {
        console.log('getCouponById: Processing expiresAt:', couponData.expiresAt, 'Type:', typeof couponData.expiresAt);
        const dateObj = new Date(couponData.expiresAt);
        if (!isNaN(dateObj.getTime())) {
          // Format date in local timezone to avoid timezone offset issues
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          expiresAtFormatted = `${year}-${month}-${day}`;
        }
        console.log('getCouponById: Formatted expiresAt:', expiresAtFormatted);
      }
    } catch (dateError) {
      console.error('getCouponById: Error processing expiresAt:', dateError);
    }

    let restrictedOrgsArray: string[] = [];
    try {
      if (couponData.restrictedOrganizations) {
        console.log('getCouponById: Processing restrictedOrganizations:', couponData.restrictedOrganizations, 'Type:', typeof couponData.restrictedOrganizations);
        if (Array.isArray(couponData.restrictedOrganizations)) {
          restrictedOrgsArray = couponData.restrictedOrganizations as string[];
        } else if (typeof couponData.restrictedOrganizations === 'object') {
          // Handle case where it's a JSON object
          restrictedOrgsArray = [];
        }
        console.log('getCouponById: Formatted restrictedOrganizations:', restrictedOrgsArray);
      }
    } catch (orgError) {
      console.error('getCouponById: Error processing restrictedOrganizations:', orgError);
    }

    const formData = {
      code: couponData.code || '',
      discountType: (couponData.discountType as 'percentage' | 'fixed_amount') || 'percentage',
      discountValue: couponData.discountValue || 0,
      organizationRestriction: (couponData.organizationRestriction as 'anyone' | 'specific') || 'anyone',
      restrictedOrganizations: restrictedOrgsArray,
      maxUses: couponData.maxUses || 1,
      minimumOrderAmount: couponData.minimumOrderAmount || 0,
      expiresAt: expiresAtFormatted,
    };

    console.log('Transformed form data:', formData);

    return {
      success: true,
      data: formData
    };

  } catch (error) {
    console.error('Error fetching coupon:', error);
    return {
      success: false,
      error: 'Failed to fetch coupon. Please try again.'
    };
  }
}

/**
 * Apply coupon to an order (increment usage count)
 */
export async function applyCouponToOrder(couponId: string): Promise<ActionResult> {
  try {
    // Get current usage count and increment it
    const coupon = await db
      .select({ currentUses: couponTable.currentUses })
      .from(couponTable)
      .where(eq(couponTable.id, couponId))
      .limit(1);

    if (coupon.length === 0) {
      return { success: false, error: 'Coupon not found' };
    }

    // Increment the usage count
    await db
      .update(couponTable)
      .set({
        currentUses: coupon[0].currentUses + 1
      })
      .where(eq(couponTable.id, couponId));

    return { success: true };

  } catch (error) {
    console.error('Error applying coupon to order:', error);
    return {
      success: false,
      error: 'Failed to apply coupon to order'
    };
  }
}