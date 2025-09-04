import 'server-only';

import { cache } from 'react';
import { notFound } from 'next/navigation';

import { db, desc, eq, and, isNull, or } from '@workspace/database/client';
import { 
  product, 
  productCategory,
  organizationPricing,
  eventYear
} from '@workspace/database/schema';

import { getOrganizationBySlug } from '~/data/organizations/get-organization-by-slug';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';
import type { RegistrationProductDto } from '~/types/dtos/registration-product-dto';

export const getRegistrationProducts = cache(async (organizationSlug: string): Promise<RegistrationProductDto[]> => {
  const organization = await getOrganizationBySlug(organizationSlug);
  
  if (!organization) {
    notFound();
  }

  const currentEventYear = await getCurrentEventYear();
  if (!currentEventYear) {
    return [];
  }

  try {
    // Get products with category and organization-specific pricing
    const productsWithDetails = await db
      .select({
        // Product fields
        productId: product.id,
        productName: product.name,
        productDescription: product.description,
        productType: product.type,
        productStatus: product.status,
        productBasePrice: product.basePrice,
        productRequiresDeposit: product.requiresDeposit,
        productDepositAmount: product.depositAmount,
        productMaxQuantityPerOrg: product.maxQuantityPerOrg,
        productTotalInventory: product.totalInventory,
        productImageUrl: product.imageUrl,
        productCreatedAt: product.createdAt,
        productUpdatedAt: product.updatedAt,
        // Category fields
        categoryId: productCategory.id,
        categoryName: productCategory.name,
        categoryDescription: productCategory.description,
        // Organization pricing fields (if exists)
        orgPricingId: organizationPricing.id,
        orgCustomPrice: organizationPricing.customPrice,
        orgCustomDepositAmount: organizationPricing.customDepositAmount,
      })
      .from(product)
      .innerJoin(productCategory, eq(product.categoryId, productCategory.id))
      .leftJoin(organizationPricing, and(
        eq(organizationPricing.productId, product.id),
        eq(organizationPricing.organizationId, organization.id)
      ))
      .where(eq(product.eventYearId, currentEventYear.id))
      .orderBy(desc(product.createdAt));

    // Transform to DTOs
    const products: RegistrationProductDto[] = productsWithDetails.map((row) => ({
      id: row.productId,
      name: row.productName,
      description: row.productDescription || undefined,
      type: row.productType as RegistrationProductDto['type'],
      status: row.productStatus as RegistrationProductDto['status'],
      basePrice: row.productBasePrice,
      requiresDeposit: row.productRequiresDeposit,
      depositAmount: row.productDepositAmount || undefined,
      maxQuantityPerOrg: row.productMaxQuantityPerOrg || undefined,
      totalInventory: row.productTotalInventory || undefined,
      imageUrl: row.productImageUrl || undefined,
      createdAt: row.productCreatedAt,
      updatedAt: row.productUpdatedAt,
      category: {
        id: row.categoryId,
        name: row.categoryName,
        description: row.categoryDescription || undefined,
      },
      organizationPrice: row.orgPricingId ? {
        customPrice: row.orgCustomPrice!,
        customDepositAmount: row.orgCustomDepositAmount || undefined,
      } : undefined,
    }));

    return products;
  } catch (error) {
    console.error('Error fetching registration products:', error);
    throw new Error('Failed to fetch registration products');
  }
});