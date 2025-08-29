// TEMPORARY BACKUP OF NEW SCHEMA ADDITIONS FROM THIS AFTERNOON
// These will be re-added once the Drizzle ORM issue is resolved

import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { enumToPgEnum } from './schema';

// New enums that were added this afternoon
export enum PaymentType {
  TEAM_REGISTRATION = 'team_registration',
  TENT_RENTAL = 'tent_rental',
  PRODUCT_PURCHASE = 'product_purchase',
  DEPOSIT_PAYMENT = 'deposit_payment',
  BALANCE_PAYMENT = 'balance_payment'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum ProductType {
  TENT_RENTAL = 'tent_rental',
  TEAM_REGISTRATION = 'team_registration', 
  MERCHANDISE = 'merchandise',
  EQUIPMENT = 'equipment',
  SERVICES = 'services'
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DEPOSIT_PAID = 'deposit_paid',
  FULLY_PAID = 'fully_paid',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// TODO: Add all the new tables (eventYearTable, paymentTable, productTable, etc.) here
// once we identify the specific problematic table