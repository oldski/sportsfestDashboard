import {relations, sql} from 'drizzle-orm';
import {
  boolean,
  customType,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';

// Custom Types
export const bytea = customType<{
  data: Buffer | null;
  notNull: false;
  default: false;
}>({
  dataType() {
    return 'bytea';
  },
  toDriver(val: Buffer | null) {
    return val;
  },
  fromDriver(value: unknown) {
    if (value === null) {
      return null;
    }

    if (value instanceof Buffer) {
      return value;
    }

    if (typeof value === 'string') {
      return Buffer.from(value, 'hex');
    }

    throw new Error(`Unexpected type received from driver: ${typeof value}`);
  }
});

// Enums
export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete'
}

export enum ActorType {
  SYSTEM = 'system',
  MEMBER = 'member',
  API = 'api'
}

export enum ContactRecord {
  PERSON = 'person',
  COMPANY = 'company'
}

export enum ContactStage {
  LEAD = 'lead',
  QUALIFIED = 'qualified',
  OPPORTUNITY = 'opportunity',
  PROPOSAL = 'proposal',
  IN_NEGOTIATION = 'inNegotiation',
  LOST = 'lost',
  WON = 'won'
}

export enum ContactTaskStatus {
  OPEN = 'open',
  COMPLETED = 'completed'
}

export enum DayOfWeek {
  SUNDAY = 'sunday',
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday'
}

export enum FeedbackCategory {
  SUGGESTION = 'suggestion',
  PROBLEM = 'problem',
  QUESTION = 'question'
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REVOKED = 'revoked'
}

export enum Role {
  MEMBER = 'member',
  ADMIN = 'admin'
}

export enum WebhookTrigger {
  CONTACT_CREATED = 'contactCreated',
  CONTACT_UPDATED = 'contactUpdated',
  CONTACT_DELETED = 'contactDeleted'
}

// SportsFest Enums
export enum EventType {
  BEACH_VOLLEYBALL = 'beach_volleyball',
  TUG_OF_WAR = 'tug_of_war',
  CORN_TOSS = 'corn_toss',
  BOTE_BEACH_CHALLENGE = 'bote_beach_challenge',
  BEACH_DODGEBALL = 'beach_dodgeball'
}

export enum PlayerStatus {
  REGISTERED = 'registered',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  NO_SHOW = 'no_show'
}

// TEMPORARILY REMOVED - PaymentType, PaymentStatus, ProductType, ProductStatus, OrderStatus enums

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  NON_BINARY = 'non_binary',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

export enum TShirtSize {
  XS = 'xs',
  S = 's',
  M = 'm',
  L = 'l',
  XL = 'xl',
  XXL = 'xxl',
  XXXL = 'xxxl'
}

// SportsFest Payment/Order System Enums
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

function enumToPgEnum<T extends Record<string, string>>(myEnum: T) {
  return Object.values(myEnum).map((value) => `${value}`) as [
    T[keyof T],
    ...T[keyof T][]
  ];
}

export const eventTypeEnum = pgEnum('eventtype', enumToPgEnum(EventType));
export const genderEnum = pgEnum('gender', enumToPgEnum(Gender));
export const tshirtSizeEnum = pgEnum('tshirtsize', enumToPgEnum(TShirtSize));
export const playerStatusEnum = pgEnum('playerstatus', enumToPgEnum(PlayerStatus));

// SportsFest Payment/Order System pgEnums
export const paymentTypeEnum = pgEnum('paymenttype', enumToPgEnum(PaymentType));
export const paymentStatusEnum = pgEnum('paymentstatus', enumToPgEnum(PaymentStatus));
export const productTypeEnum = pgEnum('producttype', enumToPgEnum(ProductType));
export const productStatusEnum = pgEnum('productstatus', enumToPgEnum(ProductStatus));
export const orderStatusEnum = pgEnum('orderstatus', enumToPgEnum(OrderStatus));

// use lowercase: https://github.com/drizzle-team/drizzle-orm/issues/1564#issuecomment-2320605690

export const actionTypeEnum = pgEnum('actiontype', enumToPgEnum(ActionType));
export const actorTypeEnum = pgEnum('actortype', enumToPgEnum(ActorType));
export const contactRecordEnum = pgEnum(
  'contactrecord',
  enumToPgEnum(ContactRecord)
);
export const contactStageEnum = pgEnum(
  'contactstage',
  enumToPgEnum(ContactStage)
);
export const contactTaskStatusEnum = pgEnum(
  'contacttaskstatus',
  enumToPgEnum(ContactTaskStatus)
);
export const dayOfWeekEnum = pgEnum('dayofweek', enumToPgEnum(DayOfWeek));
export const feedbackCategoryEnum = pgEnum(
  'feedbackcategory',
  enumToPgEnum(FeedbackCategory)
);
export const invitationStatusEnum = pgEnum(
  'invitationstatus',
  enumToPgEnum(InvitationStatus)
);
export const roleEnum = pgEnum('Role', enumToPgEnum(Role));
export const webhookTriggerEnum = pgEnum(
  'webhooktrigger',
  enumToPgEnum(WebhookTrigger)
);

// Tables

export const apiKeyTable = pgTable(
  'apiKey',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    organizationId: uuid('organizationId')
      .notNull()
      .references(() => organizationTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    description: varchar('description', { length: 70 }).notNull(),
    hashedKey: text('hashedKey').notNull(),
    expiresAt: timestamp('expiresAt', { precision: 3, mode: 'date' }),
    lastUsedAt: timestamp('lastUsedAt', { precision: 3, mode: 'date' }),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    uniqueIndex('IX_apiKey_hashedKey_unique').using(
      'btree',
      table.hashedKey.asc().nullsLast().op('text_ops')
    ),
    index('IX_apiKey_organizationId').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const authenticatorAppTable = pgTable(
  'authenticatorApp',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => userTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    accountName: varchar('accountName', { length: 255 }).notNull(),
    issuer: varchar('issuer', { length: 255 }).notNull(),
    secret: varchar('secret', { length: 255 }).notNull(),
    recoveryCodes: varchar('recoveryCodes', { length: 1024 }).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    uniqueIndex('IX_authenticatorApp_userId_unique').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const changeEmailRequestTable = pgTable(
  'changeEmailRequest',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => userTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    email: text('email').notNull(),
    expires: timestamp('expires', { precision: 3, mode: 'date' }).notNull(),
    valid: boolean('valid').default(false).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    index('IX_changeEmailRequest_userId').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const contactTable = pgTable(
  'contact',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    organizationId: uuid('organizationId')
      .notNull()
      .references(() => organizationTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }),
    address: varchar('address', { length: 255 }),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    image: varchar('image', { length: 2048 }),
    stage: contactStageEnum('stage').default(ContactStage.LEAD).notNull(),
    phone: varchar('phone', { length: 32 }),
    record: contactRecordEnum('record').default(ContactRecord.PERSON).notNull()
  },
  (table) => [
    index('IX_contact_organizationId').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const contactCommentTable = pgTable(
  'contactComment',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    contactId: uuid('contactId')
      .notNull()
      .references(() => contactTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    userId: uuid('userId')
      .notNull()
      .references(() => userTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    text: varchar('text', { length: 2000 }).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    index('IX_contactComment_contactId').using(
      'btree',
      table.contactId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_contactComment_userId').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const contactNoteTable = pgTable(
  'contactNote',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    contactId: uuid('contactId')
      .notNull()
      .references(() => contactTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    userId: uuid('userId')
      .notNull()
      .references(() => userTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    text: varchar('text', { length: 8000 }),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    index('IX_contactNote_contactId').using(
      'btree',
      table.contactId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_contactNote_userId').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const contactPageVisitTable = pgTable(
  'contactPageVisit',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    contactId: uuid('contactId')
      .notNull()
      .references(() => contactTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    timestamp: timestamp('timestamp', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    userId: uuid('userId').references(() => userTable.id, {
      onDelete: 'set null',
      onUpdate: 'cascade'
    })
  },
  (table) => [
    index('IX_contactPageVisit_contactId').using(
      'btree',
      table.contactId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_contactPageVisit_userId').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const contactImageTable = pgTable(
  'contactImage',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    contactId: uuid('contactId')
      .notNull()
      .references(() => contactTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    data: bytea('data'),
    contentType: varchar('contentType', { length: 255 }),
    hash: varchar('hash', { length: 64 })
  },
  (table) => [
    index('IX_contactImage_contactId').using(
      'btree',
      table.contactId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const contactTaskTable = pgTable(
  'contactTask',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    contactId: uuid('contactId')
      .notNull()
      .references(() => contactTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    title: varchar('title', { length: 255 }).notNull(),
    description: varchar('description', { length: 8000 }),
    status: contactTaskStatusEnum('status')
      .default(ContactTaskStatus.OPEN)
      .notNull(),
    dueDate: timestamp('dueDate', { precision: 3, mode: 'date' }),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    index('IX_contactTask_contactId').using(
      'btree',
      table.contactId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const favoriteTable = pgTable(
  'favorite',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => userTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    contactId: uuid('contactId')
      .notNull()
      .references(() => contactTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    order: integer('order').default(0).notNull()
  },
  (table) => [
    index('IX_favorite_contactId').using(
      'btree',
      table.contactId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_favorite_userId').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const invitationTable = pgTable(
  'invitation',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    organizationId: uuid('organizationId')
      .notNull()
      .references(() => organizationTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    token: uuid('token').notNull().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull(),
    role: roleEnum('role').default(Role.MEMBER).notNull(),
    status: invitationStatusEnum('status')
      .default(InvitationStatus.PENDING)
      .notNull(),
    lastSentAt: timestamp('lastSentAt', { precision: 3, mode: 'date' }),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    index('IX_invitation_organizationId').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_invitation_token').using(
      'btree',
      table.token.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const contactTagTable = pgTable(
  'contactTag',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    text: varchar('text', { length: 128 }).notNull()
  },
  (table) => [
    uniqueIndex('IX_contactTag_text_unique').using(
      'btree',
      table.text.asc().nullsLast().op('text_ops')
    )
  ]
);

export const accountTable = pgTable(
  'account',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    uniqueIndex('IX_account_provider_providerAccountId_unique').using(
      'btree',
      table.provider.asc().nullsLast().op('text_ops'),
      table.providerAccountId.asc().nullsLast().op('text_ops')
    ),
    index('IX_account_userId').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const feedbackTable = pgTable(
  'feedback',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    organizationId: uuid('organizationId')
      .notNull()
      .references(() => organizationTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    userId: uuid('userId').references(() => userTable.id, {
      onDelete: 'set null',
      onUpdate: 'cascade'
    }),
    category: feedbackCategoryEnum('category')
      .default(FeedbackCategory.SUGGESTION)
      .notNull(),
    message: varchar('message', { length: 4000 }).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    index('IX_feedback_organizationId').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_feedback_userId').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const notificationTable = pgTable(
  'notification',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => userTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    subject: varchar('subject', { length: 128 }),
    content: varchar('content', { length: 8000 }).notNull(),
    link: varchar('link', { length: 2000 }),
    seenAt: timestamp('seenAt', { precision: 3, mode: 'date' }),
    dismissed: boolean('dismissed').default(false).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    index('IX_notification_userId').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const resetPasswordRequestTable = pgTable(
  'resetPasswordRequest',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    email: text('email').notNull(),
    expires: timestamp('expires', { precision: 3, mode: 'date' }).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    index('IX_resetPasswordRequest_email').using(
      'btree',
      table.email.asc().nullsLast().op('text_ops')
    )
  ]
);

export const userImageTable = pgTable(
  'userImage',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => userTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    data: bytea('data'),
    contentType: varchar('contentType', { length: 255 }),
    hash: varchar('hash', { length: 64 })
  },
  (table) => [
    index('IX_userImage_userId').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const userTable = pgTable(
  'user',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: text('email').unique(),
    emailVerified: timestamp('emailVerified', { precision: 3, mode: 'date' }),
    password: varchar('password', { length: 60 }),
    lastLogin: timestamp('lastLogin', { precision: 3, mode: 'date' }),
    locale: varchar('locale', { length: 8 }).default('en-US').notNull(),
    completedOnboarding: boolean('completedOnboarding')
      .default(false)
      .notNull(),
    enabledContactsNotifications: boolean('enabledContactsNotifications')
      .default(false)
      .notNull(),
    enabledInboxNotifications: boolean('enabledInboxNotifications')
      .default(false)
      .notNull(),
    enabledNewsletter: boolean('enabledNewsletter').default(false).notNull(),
    enabledProductUpdates: boolean('enabledProductUpdates')
      .default(false)
      .notNull(),
    enabledWeeklySummary: boolean('enabledWeeklySummary')
      .default(false)
      .notNull(),
    image: varchar('image', { length: 2048 }),
    name: varchar('name', { length: 64 }).notNull(),
    phone: varchar('phone', { length: 32 }),
    isSportsFestAdmin: boolean('isSportsFestAdmin').default(false).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    uniqueIndex('IX_user_email_unique').using(
      'btree',
      table.email.asc().nullsLast().op('text_ops')
    ),
    index('IX_user_name').using(
      'btree',
      table.name.asc().nullsLast().op('text_ops')
    )
  ]
);

export const sessionTable = pgTable(
  'session',
  {
    sessionToken: text('sessionToken').primaryKey(),
    userId: uuid('userId')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    index('IX_session_userId').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const verificationTokenTable = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { precision: 3, mode: 'date' }).notNull()
  },
  (table) => [
    uniqueIndex('IX_verificationToken_identifier_unique').using(
      'btree',
      table.identifier.asc().nullsLast().op('text_ops'),
      table.token.asc().nullsLast().op('text_ops')
    )
  ]
);

export const workHoursTable = pgTable(
  'workHours',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    organizationId: uuid('organizationId')
      .notNull()
      .references(() => organizationTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    dayOfWeek: dayOfWeekEnum('dayOfWeek').default(DayOfWeek.SUNDAY).notNull()
  },
  (table) => [
    index('IX_workHours_organizationId').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const workTimeSlotTable = pgTable(
  'workTimeSlot',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    workHoursId: uuid('workHoursId')
      .notNull()
      .references(() => workHoursTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    start: timestamp('start', { precision: 2, withTimezone: false }).notNull(),
    end: timestamp('end', { precision: 2, withTimezone: false }).notNull()
  },
  (table) => [
    index('IX_workTimeSlot_workHoursId').using(
      'btree',
      table.workHoursId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const contactActivityTable = pgTable(
  'contactActivity',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    contactId: uuid('contactId')
      .notNull()
      .references(() => contactTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    actionType: actionTypeEnum('actionType').notNull(),
    actorId: varchar('actorId', { length: 255 }).notNull(),
    actorType: actorTypeEnum('actorType').notNull(),
    metadata: jsonb('metadata'),
    occurredAt: timestamp('occurredAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index('IX_contactActivity_contactId').using(
      'btree',
      table.contactId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_contactActivity_occurredAt').using(
      'btree',
      table.occurredAt.asc().nullsLast().op('timestamp_ops')
    )
  ]
);

export const webhookTable = pgTable(
  'webhook',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    organizationId: uuid('organizationId')
      .notNull()
      .references(() => organizationTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    secret: varchar('secret', { length: 1024 }),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    triggers: webhookTriggerEnum('triggers').array().notNull(),
    url: varchar('url', { length: 2000 }).notNull()
  },
  (table) => [
    {
      organizationIdIndex: index('IX_webhook_organizationId').on(
        table.organizationId
      )
    }
  ]
);

export const membershipTable = pgTable(
  'membership',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    organizationId: uuid('organizationId')
      .notNull()
      .references(() => organizationTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    userId: uuid('userId')
      .notNull()
      .references(() => userTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    role: roleEnum('role').default(Role.MEMBER).notNull(),
    isOwner: boolean('isOwner').default(false).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
  },
  (table) => [
    uniqueIndex('IX_membership_organizationId_userId_unique').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops'),
      table.userId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_membership_userId').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_membership_organizationId').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const organizationLogoTable = pgTable(
  'organizationLogo',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    organizationId: uuid('organizationId')
      .notNull()
      .references(() => organizationTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    data: bytea('data'),
    contentType: varchar('contentType', { length: 255 }),
    hash: varchar('hash', { length: 64 })
  },
  (table) => [
    index('IX_organizationLogo_organizationId').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const organizationTable = pgTable(
  'organization',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    address: varchar('address', { length: 255 }),
    address2: varchar('address2', { length: 255 }),
    city: varchar('city', { length: 100 }),
    state: varchar('state', { length: 50 }),
    zip: varchar('zip', { length: 10 }),
    email: varchar('email', { length: 255 }),
    website: varchar('website', { length: 2000 }),
    phone: varchar('phone', { length: 32 }),
    facebookPage: varchar('facebookPage', { length: 2000 }),
    instagramProfile: varchar('instagramProfile', { length: 2000 }),
    linkedInProfile: varchar('linkedInProfile', { length: 2000 }),
    tikTokProfile: varchar('tikTokProfile', { length: 2000 }),
    xProfile: varchar('xProfile', { length: 2000 }),
    youTubeChannel: varchar('youTubeChannel', { length: 2000 }),
    logo: varchar('logo', { length: 2048 }),
    slug: varchar('slug', { length: 255 }).notNull(),
    billingCustomerId: varchar('billingCustomerId', { length: 255 }),
    billingEmail: varchar('billingEmail', { length: 255 }),
    billingLine1: varchar('billingLine1', { length: 255 }),
    billingLine2: varchar('billingLine2', { length: 255 }),
    billingCountry: varchar('billingCountry', { length: 3 }),
    billingPostalCode: varchar('billingPostalCode', { length: 16 }),
    billingCity: varchar('billingCity', { length: 255 }),
    billingState: varchar('billingState', { length: 255 })
  },
  (table) => [
    index('IX_organization_billingCustomerId').using(
      'btree',
      table.billingCustomerId.asc().nullsLast().op('text_ops')
    ),
    uniqueIndex('IX_organization_slug_unique').using(
      'btree',
      table.slug.asc().nullsLast().op('text_ops')
    )
  ]
);

export const subscriptionTable = pgTable('subscription', {
  id: text('id').primaryKey(),
  organizationId: uuid('organizationId').notNull(),
  status: varchar('status', { length: 64 }).notNull(),
  active: boolean('active').notNull().default(false),
  provider: varchar('provider', { length: 32 }).notNull(),
  cancelAtPeriodEnd: boolean('cancelAtPeriodEnd').notNull().default(false),
  currency: varchar('currency', { length: 3 }).notNull(),
  periodStartsAt: timestamp('periodStartsAt', { withTimezone: true, precision: 6 }).notNull(),
  periodEndsAt: timestamp('periodEndsAt', { withTimezone: true, precision: 6 }).notNull(),
  trialStartsAt: timestamp('trialStartsAt', { withTimezone: true, precision: 6 }),
  trialEndsAt: timestamp('trialEndsAt', { withTimezone: true, precision: 6 }),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    index('IX_subscription_organizationId').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    )
  ]);

export const subscriptionItemTable = pgTable('subscriptionItem', {
  id: text('id').primaryKey(),
  subscriptionId: text('subscriptionId').notNull(),
  quantity: integer('quantity').notNull(),
  productId: text('productId').notNull(),
  variantId: text('variantId').notNull(),
  priceAmount: doublePrecision('priceAmount'),
  interval: text('interval').notNull(),
  intervalCount: integer('intervalCount').notNull(),
  type: text('type'),
  model: text('model'),
}, (table) => [
    index('IX_subscriptionItem_subscriptionId').using(
      'btree',
      table.subscriptionId.asc().nullsLast()
    )
  ]);


export const contactToContactTagTable = pgTable(
  'contactToContactTag',
  {
    contactId: uuid('contactId')
      .notNull()
      .references(() => contactTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    contactTagId: uuid('contactTagId')
      .notNull()
      .references(() => contactTagTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      })
  },
  (table) => [
    {
      pk: primaryKey({
        columns: [table.contactId, table.contactTagId]
      }),
      contactIdIdx: index('IX_contactToContactTag_contactId').on(
        table.contactId
      ),
      contactTagIdIdx: index('IX_contactToContactTag_contactTagId').on(
        table.contactTagId
      )
    }
  ]
);

// SportsFest Tables
export const superAdminActionTable = pgTable(
  'superAdminAction',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    performedBy: uuid('performedBy')
    .notNull()
    .references(() => userTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
    targetUserId: uuid('targetUserId')
    .notNull()
    .references(() => userTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
    action: varchar('action', { length: 50 }).notNull(), // 'granted' or 'revoked'
    reason: text('reason'), // Optional reason for the change
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
    .defaultNow()
    .notNull()
  },
  (table) => [
    index('IX_superAdminAction_performedBy').using(
      'btree',
      table.performedBy.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_superAdminAction_targetUserId').using(
      'btree',
      table.targetUserId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

// SportsFest Tables
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
    squadLeader: boolean('squadLeader').default(false).notNull(), // One per event per team
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

// Relations
export const apiKeyRelations = relations(apiKeyTable, ({ one }) => ({
  organization: one(organizationTable, {
    fields: [apiKeyTable.organizationId],
    references: [organizationTable.id],
  }),
}));

export const organizationRelations = relations(
  organizationTable,
  ({ many }) => ({
    apiKeys: many(apiKeyTable),
    contacts: many(contactTable),
    invitations: many(invitationTable),
    feedbacks: many(feedbackTable),
    workHours: many(workHoursTable),
    webhooks: many(webhookTable),
    memberships: many(membershipTable),
    // SportsFest relations
    players: many(playerTable),
    companyTeams: many(companyTeamTable),
    payments: many(paymentTable)
  })
);

export const authenticatorAppRelations = relations(
  authenticatorAppTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [authenticatorAppTable.userId],
      references: [userTable.id]
    })
  })
);

export const userRelations = relations(userTable, ({ many }) => ({
  authenticatorApps: many(authenticatorAppTable),
  changeEmailRequests: many(changeEmailRequestTable),
  contactComments: many(contactCommentTable),
  contactNotes: many(contactNoteTable),
  contactPageVisits: many(contactPageVisitTable),
  favorites: many(favoriteTable),
  accounts: many(accountTable),
  feedbacks: many(feedbackTable),
  notifications: many(notificationTable),
  sessions: many(sessionTable),
  memberships: many(membershipTable),
}));

export const changeEmailRequestRelations = relations(
  changeEmailRequestTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [changeEmailRequestTable.userId],
      references: [userTable.id]
    })
  })
);

export const contactRelations = relations(contactTable, ({ one, many }) => ({
  organization: one(organizationTable, {
    fields: [contactTable.organizationId],
    references: [organizationTable.id],
  }),
  contactComments: many(contactCommentTable),
  contactNotes: many(contactNoteTable),
  contactPageVisits: many(contactPageVisitTable),
  contactTasks: many(contactTaskTable),
  favorites: many(favoriteTable),
  contactActivities: many(contactActivityTable),
  contactToContactTags: many(contactToContactTagTable)
}));

export const contactCommentRelations = relations(
  contactCommentTable,
  ({ one }) => ({
    contact: one(contactTable, {
      fields: [contactCommentTable.contactId],
      references: [contactTable.id]
    }),
    user: one(userTable, {
      fields: [contactCommentTable.userId],
      references: [userTable.id]
    })
  })
);

export const contactNoteRelations = relations(contactNoteTable, ({ one }) => ({
  contact: one(contactTable, {
    fields: [contactNoteTable.contactId],
    references: [contactTable.id]
  }),
  user: one(userTable, {
    fields: [contactNoteTable.userId],
    references: [userTable.id]
  })
}));

export const contactPageVisitRelations = relations(
  contactPageVisitTable,
  ({ one }) => ({
    contact: one(contactTable, {
      fields: [contactPageVisitTable.contactId],
      references: [contactTable.id]
    }),
    user: one(userTable, {
      fields: [contactPageVisitTable.userId],
      references: [userTable.id]
    })
  })
);

export const contactTaskRelations = relations(contactTaskTable, ({ one }) => ({
  contact: one(contactTable, {
    fields: [contactTaskTable.contactId],
    references: [contactTable.id]
  })
}));

export const favoriteRelations = relations(favoriteTable, ({ one }) => ({
  contact: one(contactTable, {
    fields: [favoriteTable.contactId],
    references: [contactTable.id]
  }),
  user: one(userTable, {
    fields: [favoriteTable.userId],
    references: [userTable.id]
  })
}));

export const invitationRelations = relations(invitationTable, ({ one }) => ({
  organization: one(organizationTable, {
    fields: [invitationTable.organizationId],
    references: [organizationTable.id]
  })
}));

export const accountRelations = relations(accountTable, ({ one }) => ({
  user: one(userTable, {
    fields: [accountTable.userId],
    references: [userTable.id]
  })
}));

export const feedbackRelations = relations(feedbackTable, ({ one }) => ({
  organization: one(organizationTable, {
    fields: [feedbackTable.organizationId],
    references: [organizationTable.id]
  }),
  user: one(userTable, {
    fields: [feedbackTable.userId],
    references: [userTable.id]
  })
}));

export const notificationRelations = relations(
  notificationTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [notificationTable.userId],
      references: [userTable.id]
    })
  })
);

export const sessionRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id]
  })
}));

export const workHoursRelations = relations(
  workHoursTable,
  ({ one, many }) => ({
    organization: one(organizationTable, {
      fields: [workHoursTable.organizationId],
      references: [organizationTable.id]
    }),
    workTimeSlots: many(workTimeSlotTable)
  })
);

export const workTimeSlotRelations = relations(
  workTimeSlotTable,
  ({ one }) => ({
    workHour: one(workHoursTable, {
      fields: [workTimeSlotTable.workHoursId],
      references: [workHoursTable.id]
    })
  })
);

export const contactActivityRelations = relations(
  contactActivityTable,
  ({ one }) => ({
    contact: one(contactTable, {
      fields: [contactActivityTable.contactId],
      references: [contactTable.id]
    })
  })
);

export const webhookRelations = relations(webhookTable, ({ one }) => ({
  organization: one(organizationTable, {
    fields: [webhookTable.organizationId],
    references: [organizationTable.id]
  })
}));

export const membershipRelations = relations(membershipTable, ({ one }) => ({
  user: one(userTable, {
    fields: [membershipTable.userId],
    references: [userTable.id]
  }),
  organization: one(organizationTable, {
    fields: [membershipTable.organizationId],
    references: [organizationTable.id]
  })
}));

export const organizationLogoRelations = relations(
  organizationLogoTable,
  ({ one }) => ({
    organization: one(organizationTable, {
      fields: [organizationLogoTable.organizationId],
      references: [organizationTable.id]
    })
  })
);

export const subscriptionRelations = relations(subscriptionTable, ({ one }) => ({
  organization: one(organizationTable, {
    fields: [subscriptionTable.organizationId],
    references: [organizationTable.id]
  })
}));

export const subscriptionItemRelations = relations(subscriptionItemTable, ({ one }) => ({
  organization: one(subscriptionTable, {
    fields: [subscriptionItemTable.subscriptionId],
    references: [subscriptionTable.id]
  })
}));

export const contactTagRelations = relations(contactTagTable, ({ many }) => ({
  contactToContactTags: many(contactToContactTagTable)
}));

export const contactToContactTagRelations = relations(
  contactToContactTagTable,
  ({ one }) => ({
    contact: one(contactTable, {
      fields: [contactToContactTagTable.contactId],
      references: [contactTable.id]
    }),
    contactTag: one(contactTagTable, {
      fields: [contactToContactTagTable.contactTagId],
      references: [contactTagTable.id]
    })
  })
);

// SportsFest Relations
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

// Registration System Tables
export const productCategoryTable = pgTable(
  'productCategory',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    displayOrder: integer('displayOrder').default(0),
    isActive: boolean('isActive').default(true).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    uniqueIndex('IX_productCategory_name_unique').using(
      'btree',
      table.name.asc().nullsLast().op('text_ops')
    )
  ]
);

export const productTable = pgTable(
  'product',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    categoryId: uuid('categoryId')
      .notNull()
      .references(() => productCategoryTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    eventYearId: uuid('eventYearId')
      .notNull()
      .references(() => eventYearTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    image: varchar('image', { length: 2048 }),
    type: productTypeEnum('type').notNull(),
    status: productStatusEnum('status').default(ProductStatus.ACTIVE).notNull(),
    basePrice: doublePrecision('basePrice').notNull(),
    requiresDeposit: boolean('requiresDeposit').default(false).notNull(),
    depositAmount: doublePrecision('depositAmount'),
    maxQuantityPerOrg: integer('maxQuantityPerOrg'),
    totalInventory: integer('totalInventory'),
    soldCount: integer('soldcount').default(0).notNull(),
    reservedCount: integer('reservedcount').default(0).notNull(),
    displayOrder: integer('displayOrder').default(0),
    metadata: jsonb('metadata'),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    index('IX_product_categoryId').using(
      'btree',
      table.categoryId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_product_eventYearId').using(
      'btree',
      table.eventYearId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_product_status').using(
      'btree',
      table.status.asc().nullsLast()
    )
  ]
);

export const productImageTable = pgTable(
  'productImage',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    productId: uuid('productId')
      .notNull()
      .references(() => productTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    data: bytea('data'),
    contentType: varchar('contentType', { length: 255 }),
    hash: varchar('hash', { length: 64 })
  },
  (table) => [
    index('IX_productImage_productId').using(
      'btree',
      table.productId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const organizationPricingTable = pgTable(
  'organizationPricing',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    productId: uuid('productId')
      .notNull()
      .references(() => productTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    organizationId: uuid('organizationId')
      .notNull()
      .references(() => organizationTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    customPrice: doublePrecision('customPrice'),
    customDepositAmount: doublePrecision('customDepositAmount'),
    maxQuantity: integer('maxQuantity'),
    isWaived: boolean('isWaived').default(false).notNull(),
    waiverReason: text('waiverReason'),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    uniqueIndex('IX_organizationPricing_product_org_unique').using(
      'btree',
      table.productId.asc().nullsLast().op('uuid_ops'),
      table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_organizationPricing_productId').using(
      'btree',
      table.productId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_organizationPricing_organizationId').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const orderTable = pgTable(
  'order',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orderNumber: varchar('orderNumber', { length: 50 }).notNull(),
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
    status: orderStatusEnum('status').default(OrderStatus.PENDING).notNull(),
    totalAmount: doublePrecision('totalAmount').notNull(),
    depositAmount: doublePrecision('depositAmount').default(0).notNull(),
    balanceOwed: doublePrecision('balanceOwed').notNull(),
    stripeSessionId: varchar('stripeSessionId', { length: 255 }),
    stripePaymentIntentId: varchar('stripePaymentIntentId', { length: 255 }),
    isManuallyCreated: boolean('isManuallyCreated').default(false).notNull(),
    notes: text('notes'),
    metadata: jsonb('metadata').$type<{
      cartItems?: any[];
      paymentType?: 'full' | 'deposit';
      originalTotal?: number;
      couponDiscount?: number;
      appliedCoupon?: {
        id: string;
        code: string;
        discountType: 'percentage' | 'fixed_amount';
        discountValue: number;
        calculatedDiscount: number;
      } | null;
    }>(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    uniqueIndex('IX_order_orderNumber_unique').using(
      'btree',
      table.orderNumber.asc().nullsLast().op('text_ops')
    ),
    index('IX_order_organizationId').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_order_eventYearId').using(
      'btree',
      table.eventYearId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_order_status').using(
      'btree',
      table.status.asc().nullsLast()
    )
  ]
);

export const orderItemTable = pgTable(
  'orderItem',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orderId: uuid('orderId')
      .notNull()
      .references(() => orderTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    productId: uuid('productId')
      .notNull()
      .references(() => productTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    quantity: integer('quantity').notNull(),
    unitPrice: doublePrecision('unitPrice').notNull(),
    depositPrice: doublePrecision('depositPrice').default(0).notNull(),
    totalPrice: doublePrecision('totalPrice').notNull(),
    productSnapshot: jsonb('productSnapshot'), // Store product details at time of order
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    index('IX_orderItem_orderId').using(
      'btree',
      table.orderId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_orderItem_productId').using(
      'btree',
      table.productId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

export const orderPaymentTable = pgTable(
  'orderPayment',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orderId: uuid('orderId')
      .notNull()
      .references(() => orderTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    type: paymentTypeEnum('type').notNull(),
    status: paymentStatusEnum('status').default(PaymentStatus.PENDING).notNull(),
    amount: doublePrecision('amount').notNull(),
    stripePaymentIntentId: varchar('stripePaymentIntentId', { length: 255 }),
    stripeChargeId: varchar('stripeChargeId', { length: 255 }),
    paymentMethodType: varchar('paymentMethodType', { length: 50 }),
    last4: varchar('last4', { length: 4 }),
    failureReason: text('failureReason'),
    processedAt: timestamp('processedAt', { precision: 3, mode: 'date' }),
    refundedAt: timestamp('refundedAt', { precision: 3, mode: 'date' }),
    refundAmount: doublePrecision('refundAmount'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    index('IX_orderPayment_orderId').using(
      'btree',
      table.orderId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_orderPayment_status').using(
      'btree',
      table.status.asc().nullsLast()
    ),
    index('IX_orderPayment_stripePaymentIntentId').using(
      'btree',
      table.stripePaymentIntentId.asc().nullsLast().op('text_ops')
    )
  ]
);

export const orderInvoiceTable = pgTable(
  'orderInvoice',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orderId: uuid('orderId')
      .notNull()
      .references(() => orderTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    invoiceNumber: varchar('invoiceNumber', { length: 50 }).notNull(),
    totalAmount: doublePrecision('totalAmount').notNull(),
    paidAmount: doublePrecision('paidAmount').default(0).notNull(),
    balanceOwed: doublePrecision('balanceOwed').notNull(),
    status: varchar('status', { length: 20 }).default('draft').notNull(), // draft, sent, paid, overdue, cancelled
    dueDate: timestamp('dueDate', { precision: 3, mode: 'date' }),
    paidAt: timestamp('paidAt', { precision: 3, mode: 'date' }),
    sentAt: timestamp('sentAt', { precision: 3, mode: 'date' }),
    stripeInvoiceId: varchar('stripeInvoiceId', { length: 255 }),
    downloadUrl: text('downloadUrl'),
    notes: text('notes'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    uniqueIndex('IX_orderInvoice_invoiceNumber_unique').using(
      'btree',
      table.invoiceNumber.asc().nullsLast().op('text_ops')
    ),
    index('IX_orderInvoice_orderId').using(
      'btree',
      table.orderId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_orderInvoice_status').using(
      'btree',
      table.status.asc().nullsLast().op('text_ops')
    )
  ]
);

export const tentPurchaseTrackingTable = pgTable(
  'tentPurchaseTracking',
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
    tentProductId: uuid('tentProductId')
      .notNull()
      .references(() => productTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    quantityPurchased: integer('quantityPurchased').notNull(),
    maxAllowed: integer('maxAllowed').notNull(),
    remainingAllowed: integer('remainingAllowed').notNull(),
    companyTeamCount: integer('companyTeamCount').notNull().default(0),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    uniqueIndex('IX_tentPurchaseTracking_org_eventYear_product_unique').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops'),
      table.eventYearId.asc().nullsLast().op('uuid_ops'),
      table.tentProductId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_tentPurchaseTracking_organizationId').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_tentPurchaseTracking_eventYearId').using(
      'btree',
      table.eventYearId.asc().nullsLast().op('uuid_ops')
    )
  ]
);

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

// Registration System Relations
export const productCategoryRelations = relations(productCategoryTable, ({ many }) => ({
  products: many(productTable)
}));

export const productRelations = relations(productTable, ({ one, many }) => ({
  category: one(productCategoryTable, {
    fields: [productTable.categoryId],
    references: [productCategoryTable.id]
  }),
  eventYear: one(eventYearTable, {
    fields: [productTable.eventYearId],
    references: [eventYearTable.id]
  }),
  organizationPricing: many(organizationPricingTable),
  orderItems: many(orderItemTable),
  tentPurchases: many(tentPurchaseTrackingTable),
  productImage: one(productImageTable, {
    fields: [productTable.id],
    references: [productImageTable.productId]
  })
}));

export const organizationPricingRelations = relations(organizationPricingTable, ({ one }) => ({
  product: one(productTable, {
    fields: [organizationPricingTable.productId],
    references: [productTable.id]
  }),
  organization: one(organizationTable, {
    fields: [organizationPricingTable.organizationId],
    references: [organizationTable.id]
  })
}));

export const productImageRelations = relations(
  productImageTable,
  ({ one }) => ({
    product: one(productTable, {
      fields: [productImageTable.productId],
      references: [productTable.id]
    })
  })
);

export const orderRelations = relations(orderTable, ({ one, many }) => ({
  organization: one(organizationTable, {
    fields: [orderTable.organizationId],
    references: [organizationTable.id]
  }),
  eventYear: one(eventYearTable, {
    fields: [orderTable.eventYearId],
    references: [eventYearTable.id]
  }),
  orderItems: many(orderItemTable),
  payments: many(orderPaymentTable),
  invoices: many(orderInvoiceTable)
}));

export const orderItemRelations = relations(orderItemTable, ({ one }) => ({
  order: one(orderTable, {
    fields: [orderItemTable.orderId],
    references: [orderTable.id]
  }),
  product: one(productTable, {
    fields: [orderItemTable.productId],
    references: [productTable.id]
  })
}));

export const orderPaymentRelations = relations(orderPaymentTable, ({ one }) => ({
  order: one(orderTable, {
    fields: [orderPaymentTable.orderId],
    references: [orderTable.id]
  })
}));

export const orderInvoiceRelations = relations(orderInvoiceTable, ({ one }) => ({
  order: one(orderTable, {
    fields: [orderInvoiceTable.orderId],
    references: [orderTable.id]
  })
}));

export const tentPurchaseTrackingRelations = relations(tentPurchaseTrackingTable, ({ one }) => ({
  organization: one(organizationTable, {
    fields: [tentPurchaseTrackingTable.organizationId],
    references: [organizationTable.id]
  }),
  eventYear: one(eventYearTable, {
    fields: [tentPurchaseTrackingTable.eventYearId],
    references: [eventYearTable.id]
  }),
  tentProduct: one(productTable, {
    fields: [tentPurchaseTrackingTable.tentProductId],
    references: [productTable.id]
  })
}));

export const cartSessionTable = pgTable(
  'cartSession',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    sessionId: varchar('sessionId', { length: 255 }).notNull().unique(),
    organizationId: uuid('organizationId')
      .notNull()
      .references(() => organizationTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    userId: uuid('userId')
      .references(() => userTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    cartData: jsonb('cartData').notNull(), // Stores the cart items as JSON
    expiresAt: timestamp('expiresAt', { mode: 'date' }).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    index('IX_cartSession_sessionId').using(
      'btree',
      table.sessionId.asc().nullsLast().op('text_ops')
    ),
    index('IX_cartSession_organizationId').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_cartSession_userId').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_cartSession_expiresAt').using(
      'btree',
      table.expiresAt.asc().nullsLast()
    )
  ]
);

export const cartSessionRelations = relations(cartSessionTable, ({ one }) => ({
  organization: one(organizationTable, {
    fields: [cartSessionTable.organizationId],
    references: [organizationTable.id]
  }),
  user: one(userTable, {
    fields: [cartSessionTable.userId],
    references: [userTable.id]
  })
}));

export const couponTable = pgTable(
  'coupon',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    eventYearId: uuid('eventYearId')
      .notNull()
      .references(() => eventYearTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    discountType: varchar('discountType', { length: 20 }).notNull(), // 'percentage' | 'fixed_amount'
    discountValue: doublePrecision('discountValue').notNull(),
    organizationRestriction: varchar('organizationRestriction', { length: 20 }).default('anyone').notNull(), // 'anyone' | 'specific'
    restrictedOrganizations: jsonb('restrictedOrganizations'), // Array of organization IDs when restriction is 'specific'
    maxUses: integer('maxUses').default(1).notNull(),
    currentUses: integer('currentUses').default(0).notNull(),
    minimumOrderAmount: doublePrecision('minimumOrderAmount').default(0).notNull(),
    isActive: boolean('isActive').default(true).notNull(),
    expiresAt: timestamp('expiresAt', { precision: 3, mode: 'date' }),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => [
    index('IX_coupon_code').using(
      'btree',
      table.code.asc().nullsLast().op('text_ops')
    ),
    index('IX_coupon_eventYearId').using(
      'btree',
      table.eventYearId.asc().nullsLast().op('uuid_ops')
    ),
    index('IX_coupon_isActive').using(
      'btree',
      table.isActive.asc().nullsLast()
    ),
    index('IX_coupon_expiresAt').using(
      'btree',
      table.expiresAt.asc().nullsLast()
    )
  ]
);

export const couponRelations = relations(couponTable, ({ one }) => ({
  eventYear: one(eventYearTable, {
    fields: [couponTable.eventYearId],
    references: [eventYearTable.id]
  })
}));

// Table aliases for imports
export const cartSession = cartSessionTable;
export const coupon = couponTable;
export const order = orderTable;
export const orderItem = orderItemTable;
export const orderPayment = orderPaymentTable;
export const orderInvoice = orderInvoiceTable;
export const product = productTable;
export const productCategory = productCategoryTable;
export const productImage = productImageTable;
export const organizationPricing = organizationPricingTable;
export const tentPurchaseTracking = tentPurchaseTrackingTable;

