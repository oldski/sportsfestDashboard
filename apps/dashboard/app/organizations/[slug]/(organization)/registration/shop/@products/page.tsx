import * as React from 'react';

import { getRegistrationProducts } from '~/data/registration/get-products';
import { ProductCards } from '~/components/organizations/slug/registration/product-cards';
import type { RegistrationProductDto } from '~/types/dtos/registration-product-dto';

// Test data to showcase the product functionality
const mockProducts: RegistrationProductDto[] = [
  {
    id: 'prod-1',
    name: 'SportsFest Team Registration',
    description: 'Basic team registration package includes entry to all events, team t-shirts, and lunch vouchers.',
    type: 'membership',
    status: 'active',
    basePrice: 150.00,
    requiresDeposit: true,
    depositAmount: 50.00,
    maxQuantityPerOrg: 5,
    imageUrl: '/images/team-registration.jpg',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    category: {
      id: 'cat-1',
      name: 'Registration',
      description: 'Team and individual registration packages'
    }
  },
  {
    id: 'prod-2',
    name: '10x10 Event Tent',
    description: 'Standard 10x10 event tent with setup and takedown service included.',
    type: 'physical',
    status: 'active',
    basePrice: 200.00,
    requiresDeposit: false,
    maxQuantityPerOrg: 3,
    totalInventory: 50,
    imageUrl: '/images/event-tent.jpg',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    category: {
      id: 'cat-2',
      name: 'Equipment',
      description: 'Tents, tables, chairs, and event equipment'
    }
  },
  {
    id: 'prod-3',
    name: 'SportsFest T-Shirt',
    description: 'Official SportsFest 2025 t-shirt. Available in sizes S-XXXL.',
    type: 'physical',
    status: 'active',
    basePrice: 25.00,
    requiresDeposit: false,
    maxQuantityPerOrg: 100,
    totalInventory: 1000,
    imageUrl: '/images/tshirt.jpg',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    category: {
      id: 'cat-3',
      name: 'Merchandise',
      description: 'SportsFest branded merchandise and apparel'
    }
  },
  {
    id: 'prod-4',
    name: 'Team Lunch Package',
    description: 'Catered lunch for your entire team. Includes vegetarian and gluten-free options.',
    type: 'service',
    status: 'active',
    basePrice: 15.00,
    requiresDeposit: true,
    depositAmount: 5.00,
    maxQuantityPerOrg: 200,
    imageUrl: '/images/lunch-package.jpg',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    category: {
      id: 'cat-4',
      name: 'Catering',
      description: 'Food and beverage packages'
    }
  },
  {
    id: 'prod-5',
    name: '20x20 Premium Event Tent',
    description: 'Large premium tent perfect for sponsor areas or team headquarters.',
    type: 'physical',
    status: 'active',
    basePrice: 500.00,
    requiresDeposit: true,
    depositAmount: 200.00,
    maxQuantityPerOrg: 2,
    totalInventory: 20,
    imageUrl: '/images/premium-tent.jpg',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    category: {
      id: 'cat-2',
      name: 'Equipment',
      description: 'Tents, tables, chairs, and event equipment'
    }
  },
  {
    id: 'prod-6',
    name: 'Equipment Setup Fee',
    description: 'Professional setup and breakdown service for all equipment rentals.',
    type: 'service',
    status: 'active',
    basePrice: 250.00,
    requiresDeposit: false,
    maxQuantityPerOrg: 1,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    category: {
      id: 'cat-5',
      name: 'Services',
      description: 'Setup, breakdown, and support services'
    }
  },
  {
    id: 'prod-7',
    name: 'Custom Team Banner',
    description: 'Custom printed team banner with your organization logo and colors.',
    type: 'physical',
    status: 'out_of_stock',
    basePrice: 75.00,
    requiresDeposit: true,
    depositAmount: 25.00,
    maxQuantityPerOrg: 5,
    totalInventory: 0,
    imageUrl: '/images/team-banner.jpg',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    category: {
      id: 'cat-3',
      name: 'Merchandise',
      description: 'SportsFest branded merchandise and apparel'
    }
  }
];

export default async function ProductsPage(): Promise<React.JSX.Element> {
  // For testing purposes, use mock data. In production, uncomment the line below:
  // const products = await getRegistrationProducts();
  const products = mockProducts;

  return <ProductCards products={products} />;
}
