// COMPLETE BACKUP OF ALL NEW SCHEMA ADDITIONS FROM THIS AFTERNOON
// Created: 2025-08-28 - SportsFest Payment/Order System Architecture
// This backup contains all the new enums, tables, and relations that were causing Drizzle ORM issues
// Will be re-added piece by piece once the specific problematic component is identified

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
  varchar,
  sql
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { enumToPgEnum } from './schema';

// ===== NEW ENUMS ADDED THIS AFTERNOON =====

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

// Convert enums to pgEnum
const paymentTypeEnum = enumToPgEnum('paymentType', PaymentType);
const paymentStatusEnum = enumToPgEnum('paymentStatus', PaymentStatus);
const productTypeEnum = enumToPgEnum('productType', ProductType);
const productStatusEnum = enumToPgEnum('productStatus', ProductStatus);
const orderStatusEnum = enumToPgEnum('orderStatus', OrderStatus);

// ===== NEW TABLES ADDED THIS AFTERNOON =====

export const eventYearTable = pgTable(
  'eventYear',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    year: integer('year').notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    eventStartDate: timestamp('eventStartDate', { precision: 3, mode: 'date' }).notNull(),
    eventEndDate: timestamp('eventEndDate', { precision: 3, mode: 'date' }).notNull(),
    registrationOpen: timestamp('registrationOpen', { precision: 3, mode: 'date' }).notNull(),
    registrationClose: timestamp('registrationClose', { precision: 3, mode: 'date' }).notNull(),
    locationName: varchar('locationName', { length: 255 }).notNull(),
    address: varchar('address', { length: 255 }).notNull(),
    city: varchar('city', { length: 100 }).notNull(),
    state: varchar('state', { length: 50 }).notNull(),
    zipCode: varchar('zipCode', { length: 20 }).notNull(),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    isActive: boolean('isActive').default(false).notNull(),
    isDeleted: boolean('isDeleted').default(false).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
    .defaultNow()
    .notNull()
  },
  (table) => [
    uniqueIndex('IX_eventYear_year_unique').using(
      'btree',
      table.year.asc().nullsLast()
    )
  ]
);

export const playerTable = pgTable(
  'player',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    organizationId: uuid('organizationId')
    .notNull()
    .references(() => organizationTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
    eventYearId: uuid('eventYearId')
    .notNull()
    .references(() => eventYearTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
    firstName: varchar('firstName', { length: 100 }).notNull(),
    lastName: varchar('lastName', { length: 100 }).notNull(),
    dateOfBirth: timestamp('dateOfBirth', { precision: 3, mode: 'date' }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 32 }), // Optional
    gender: genderEnum('gender').notNull(),
    tshirtSize: tshirtSizeEnum('tshirtSize').notNull(),
    accuracyConfirmed: boolean('accuracyConfirmed').default(false).notNull(),
    waiverSigned: boolean('waiverSigned').default(false).notNull(),
    status: playerStatusEnum('status').default(PlayerStatus.REGISTERED).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
    .defaultNow()
    .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
  },
  (table) => [
    // Email unique across ALL organizations AND event years
    uniqueIndex('IX_player_email_eventYear_unique').using(
      'btree',
      table.email.asc().nullsLast().op('text_ops'),
      table.eventYearId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_player_organizationId').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    // Age validation constraint
    sql`CHECK (EXTRACT(YEAR FROM AGE(dateOfBirth)) >= 18)`
  ]
);

export const playerEventInterestTable = pgTable(
  'playerEventInterest',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    playerId: uuid('playerId')
    .notNull()
    .references(() => playerTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
    eventType: eventTypeEnum('eventType').notNull(),
    interestRating: integer('interestRating').notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
    .defaultNow()
    .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
  },
  (table) => [
    uniqueIndex('IX_playerEventInterest_playerId_eventType_unique').using(
      'btree',
      table.playerId.asc().nullsLast().op('uuid_ops'),
      table.eventType.asc().nullsLast()
    ),
    // Constraint: ratings must be 1-5
    sql`CHECK (interestRating >= 1 AND interestRating <= 5)`
  ]
);

export const companyTeamTable = pgTable(
  'companyTeam',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    organizationId: uuid('organizationId')
    .notNull()
    .references(() => organizationTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
    eventYearId: uuid('eventYearId')
    .notNull()
    .references(() => eventYearTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
    teamNumber: integer('teamNumber').notNull(), // 1, 2, 3, etc.
    name: varchar('name', { length: 255 }), // "Acme Warriors", "Tech Titans"
    isPaid: boolean('isPaid').default(false).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
    .defaultNow()
    .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
  },
  (table) => [
    // Unique team numbers per organization per year
    uniqueIndex('IX_companyTeam_org_eventYear_number_unique').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops'),
      table.eventYearId.asc().nullsLast().op('uuid_ops'),
      table.teamNumber.asc().nullsLast()
    ),
    index('IX_companyTeam_organizationId').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const teamRosterTable = pgTable(
  'teamRoster',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    companyTeamId: uuid('companyTeamId')
    .notNull()
    .references(() => companyTeamTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
    playerId: uuid('playerId')
    .notNull()
    .references(() => playerTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
    isCaptain: boolean('isCaptain').default(false).notNull(),
    assignedAt: timestamp('assignedAt', { precision: 3, mode: 'date' })
    .defaultNow()
    .notNull()
  },
  (table) => [
    // Player can only be on one company team (but captains can move them)
    uniqueIndex('IX_teamRoster_playerId_unique').using(
      'btree',
      table.playerId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_teamRoster_companyTeamId').using(
      'btree',
      table.companyTeamId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const eventRosterTable = pgTable(
  'eventRoster',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    companyTeamId: uuid('companyTeamId')
    .notNull()
    .references(() => companyTeamTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
    playerId: uuid('playerId')
    .notNull()
    .references(() => playerTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
    eventType: eventTypeEnum('eventType').notNull(),
    isStarter: boolean('isStarter').default(true).notNull(), // Starter vs backup
    assignedAt: timestamp('assignedAt', { precision: 3, mode: 'date' })
    .defaultNow()
    .notNull()
  },
  (table) => [
    // Player can be in multiple events but only once per event per company team
    uniqueIndex('IX_eventRoster_player_companyTeam_event_unique').using(
      'btree',
      table.playerId.asc().nullsLast().op('uuid_ops'),
      table.companyTeamId.asc().nullsLast().op('uuid_ops'),
      table.eventType.asc().nullsLast()
    ),
    index('IX_eventRoster_companyTeamId').using(
      'btree',
      table.companyTeamId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const paymentTable = pgTable(
  'payment',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    organizationId: uuid('organizationId')
    .notNull()
    .references(() => organizationTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
    eventYearId: uuid('eventYearId')
    .notNull()
    .references(() => eventYearTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
    paymentType: paymentTypeEnum('paymentType').notNull(),
    amount: doublePrecision('amount').notNull(),
    status: paymentStatusEnum('status').default(PaymentStatus.PENDING).notNull(),
    stripePaymentIntentId: varchar('stripePaymentIntentId', { length: 255 }),
    paidAt: timestamp('paidAt', { precision: 3, mode: 'date' }),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
    .defaultNow()
    .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
  },
  (table) => [
    index('IX_payment_organizationId').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_payment_eventYearId').using(
      'btree',
      table.eventYearId.asc().nullsLast().op('uuid_ops')
    ),
    uniqueIndex('IX_payment_stripe_unique').using(
      'btree',
      table.stripePaymentIntentId.asc().nullsLast().op('text_ops')
    )
  ]
);

// ===== UPDATED ORGANIZATION RELATIONS =====
// Note: This was added to the existing organizationRelations
const updatedOrganizationRelationsAdditions = {
  // Add SportsFest relations
  players: 'many(playerTable)',
  companyTeams: 'many(companyTeamTable)',
  payments: 'many(paymentTable)',
};

// ===== NEW RELATIONS ADDED THIS AFTERNOON =====

export const eventYearRelations = relations(eventYearTable, ({ many }) => ({
  players: many(playerTable),
  companyTeams: many(companyTeamTable),
  payments: many(paymentTable)
}));

export const playerRelations = relations(playerTable, ({ one, many }) => ({
  organization: one(organizationTable, {
    fields: [playerTable.organizationId],
    references: [organizationTable.id]
  }),
  eventYear: one(eventYearTable, {
    fields: [playerTable.eventYearId],
    references: [eventYearTable.id]
  }),
  eventInterests: many(playerEventInterestTable),
  teamMembership: one(teamRosterTable), // Player can only be on one company team
  eventRosters: many(eventRosterTable) // But can be in multiple event rosters
}));

export const playerEventInterestRelations = relations(playerEventInterestTable, ({ one }) => ({
  player: one(playerTable, {
    fields: [playerEventInterestTable.playerId],
    references: [playerTable.id]
  })
}));

export const paymentRelations = relations(paymentTable, ({ one }) => ({
  organization: one(organizationTable, {
    fields: [paymentTable.organizationId],
    references: [organizationTable.id]
  }),
  eventYear: one(eventYearTable, {
    fields: [paymentTable.eventYearId],
    references: [eventYearTable.id]
  })
}));

export const companyTeamRelations = relations(companyTeamTable, ({ one, many }) => ({
  organization: one(organizationTable, {
    fields: [companyTeamTable.organizationId],
    references: [organizationTable.id]
  }),
  eventYear: one(eventYearTable, {
    fields: [companyTeamTable.eventYearId],
    references: [eventYearTable.id]
  }),
  teamRoster: many(teamRosterTable),
  eventRosters: many(eventRosterTable)
}));

export const teamRosterRelations = relations(teamRosterTable, ({ one }) => ({
  companyTeam: one(companyTeamTable, {
    fields: [teamRosterTable.companyTeamId],
    references: [companyTeamTable.id]
  }),
  player: one(playerTable, {
    fields: [teamRosterTable.playerId],
    references: [playerTable.id]
  })
}));

export const eventRosterRelations = relations(eventRosterTable, ({ one }) => ({
  companyTeam: one(companyTeamTable, {
    fields: [eventRosterTable.companyTeamId],
    references: [companyTeamTable.id]
  }),
  player: one(playerTable, {
    fields: [eventRosterTable.playerId],
    references: [playerTable.id]
  })
}));

// ===== NOTES =====
// 
// Tables added in order of creation this afternoon:
// 1. eventYearTable - Main event year tracking
// 2. playerTable - Individual player registration
// 3. playerEventInterestTable - Player sport preferences 
// 4. companyTeamTable - Company team management
// 5. teamRosterTable - Team membership
// 6. eventRosterTable - Event-specific team rosters
// 7. paymentTable - Payment processing
//
// Key relationships:
// - Organization -> Players, CompanyTeams, Payments
// - EventYear -> Players, CompanyTeams, Payments
// - Player -> Organization, EventYear, EventInterests, TeamMembership, EventRosters
// - CompanyTeam -> Organization, EventYear, TeamRoster, EventRosters
//
// Complex features causing potential Drizzle issues:
// - Nested select objects with membership data
// - SQL expressions for counts and aggregations
// - Multiple foreign key constraints with cascade deletes
// - Complex unique indexes across multiple columns
// - CHECK constraints for data validation
//
// Plan for re-adding:
// 1. Add enums first, test
// 2. Add eventYearTable only, test
// 3. Add playerTable, test
// 4. Add remaining tables one by one
// 5. Add relations last, test after each addition