import { pgTable } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';
import { isNull } from 'drizzle-orm';

export const user = pgTable('user', {
  id: t.text('id').primaryKey(),
  name: t.text('name').notNull(),
  email: t.varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: t.boolean('email_verified').notNull(),
  image: t.text('image'),
  createdAt: t.timestamp('created_at', { precision: 6, withTimezone: true }).notNull(),
  updatedAt: t.timestamp('updated_at', { precision: 6, withTimezone: true }).notNull()
});

export const session = pgTable(
  'session',
  {
    id: t.text('id').primaryKey(),
    userId: t
      .text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    token: t.varchar('token', { length: 255 }).notNull().unique(),
    expiresAt: t.timestamp('expires_at', { precision: 6, withTimezone: true }).notNull(),
    ipAddress: t.text('ip_address'),
    userAgent: t.text('user_agent'),
    createdAt: t.timestamp('created_at', { precision: 6, withTimezone: true }).notNull(),
    updatedAt: t.timestamp('updated_at', { precision: 6, withTimezone: true }).notNull()
  },
  (table) => [t.index('session_userId_idx').on(table.userId)]
);

export const account = pgTable(
  'account',
  {
    id: t.text('id').primaryKey(),
    userId: t
      .text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accountId: t.text('account_id').notNull(),
    providerId: t.text('provider_id').notNull(),
    accessToken: t.text('access_token'),
    refreshToken: t.text('refresh_token'),
    accessTokenExpiresAt: t.timestamp('access_token_expires_at', {
      precision: 6,
      withTimezone: true
    }),
    refreshTokenExpiresAt: t.timestamp('refresh_token_expires_at', {
      precision: 6,
      withTimezone: true
    }),
    scope: t.text('scope'),
    idToken: t.text('id_token'),
    password: t.text('password'),
    createdAt: t.timestamp('created_at', { precision: 6, withTimezone: true }).notNull(),
    updatedAt: t.timestamp('updated_at', { precision: 6, withTimezone: true }).notNull()
  },
  (table) => [t.index('account_userId_idx').on(table.userId)]
);

export const verification = pgTable(
  'verification',
  {
    id: t.text('id').primaryKey(),
    identifier: t.text('identifier').notNull(),
    value: t.text('value').notNull(),
    expiresAt: t.timestamp('expires_at', { precision: 6, withTimezone: true }).notNull(),
    createdAt: t.timestamp('created_at', { precision: 6, withTimezone: true }).notNull(),
    updatedAt: t.timestamp('updated_at', { precision: 6, withTimezone: true }).notNull()
  },
  (table) => [t.index('verification_identifier_idx').on(table.identifier)]
);

export const itemStatus = t.pgEnum('item_status', ['available', 'booked', 'out_of_service']);

export const itemTable = pgTable('item', {
  id: t.serial().primaryKey(),
  name: t.text().notNull(),
  description: t.text(),
  is_available: t.boolean().notNull().default(true),
  is_lent_out: t.boolean().notNull().default(false),
  is_damaged: t.boolean().notNull().default(false)
});

export const checkoutTable = pgTable(
  'checkout',
  {
    id: t.serial().primaryKey(),
    itemId: t
      .integer('item_id')
      .notNull()
      .references(() => itemTable.id, { onDelete: 'cascade' }),
    borrowerId: t
      .text('borrower_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    checkedOutAt: t
      .timestamp('checked_out_at', { precision: 6, withTimezone: true })
      .notNull()
      .defaultNow(),
    returnedAt: t.timestamp('returned_at', { precision: 6, withTimezone: true })
  },
  (table) => [
    t.uniqueIndex('checkout_open_item_idx').on(table.itemId).where(isNull(table.returnedAt)),
    t.index('checkout_borrowerId_idx').on(table.borrowerId)
  ]
);

export const superAdminTable = pgTable('super_admin', {
  id: t.serial().primaryKey(),
  userId: t
    .text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' })
});

export const adminTable = pgTable('admin', {
  id: t.serial().primaryKey(),
  userId: t
    .text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' })
});

export const orgTable = pgTable(
  'organization',
  {
    id: t.serial().primaryKey(),
    name: t.text('name').notNull(),
    description: t.text('description').notNull(),
    svgDataUrl: t.text('svg_data_url'),
    path: t.text('path').notNull()
  },
  (table) => [t.index('organization_path_index').on(table.path)]
);

export const orgPositionsTable = pgTable('org_positions', {
  id: t.serial().primaryKey(),
  userId: t
    .text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  positions: t.jsonb('positions').$type<number[]>().notNull()
});

export const eventStatusPgEnum = t.pgEnum('status', ['accepted', 'pending', 'canceled']);

export const reservationTable = pgTable('reservation', {
  id: t.serial().primaryKey(),
  status: eventStatusPgEnum().notNull(),
  start: t.timestamp('start', { precision: 6, withTimezone: true }).notNull(),
  end: t.timestamp('end', { precision: 6, withTimezone: true }).notNull(),
  allDay: t.boolean('all_day').notNull()
});

export const orgItemTable = pgTable(
  'org_item',
  {
    id: t.serial().primaryKey(),
    orgId: t
      .integer('org_id')
      .notNull()
      .references(() => orgTable.id, { onDelete: 'cascade' }),
    itemId: t
      .integer('item_id')
      .notNull()
      .references(() => itemTable.id, { onDelete: 'cascade' })
  },
  (table) => [
    t.unique('org_item_org_item_unique').on(table.orgId, table.itemId),
    t.index('org_item_item_id_idx').on(table.itemId)
  ]
);

export const orgMemberTable = pgTable(
  'org_member',
  {
    id: t.serial().primaryKey(),
    userId: t
      .text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    orgId: t
      .integer('org_id')
      .notNull()
      .references(() => orgTable.id, { onDelete: 'cascade' })
  },
  (table) => [
    t.unique('org_member_user_org_unique').on(table.userId, table.orgId),
    t.index('org_member_org_id_index').on(table.orgId)
  ]
);
