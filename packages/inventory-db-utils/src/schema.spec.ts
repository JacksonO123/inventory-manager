import { getTableConfig } from 'drizzle-orm/pg-core';
import {
  user,
  session,
  account,
  verification,
  itemTable,
  superAdminTable,
  adminTable,
  orgTable,
  orgPositionsTable,
  reservationTable,
  orgItemTable,
  orgMemberTable
} from './schema';

const columnNames = (table: unknown) => getTableConfig(table as never).columns.map((column) => column.name);

describe('schema table names', () => {
  it.each([
    [user, 'user'],
    [session, 'session'],
    [account, 'account'],
    [verification, 'verification'],
    [itemTable, 'item'],
    [superAdminTable, 'super_admin'],
    [adminTable, 'admin'],
    [orgTable, 'organization'],
    [orgPositionsTable, 'org_positions'],
    [reservationTable, 'reservation'],
    [orgItemTable, 'org_item'],
    [orgMemberTable, 'org_member']
  ])('maps %s to its database table', (table, expected) => {
    expect(getTableConfig(table as never).name).toBe(expected);
  });
});

describe('schema columns', () => {
  it('declares the item columns', () => {
    expect(columnNames(itemTable)).toEqual(['id', 'name', 'description', 'status']);
  });

  it('declares the organization columns', () => {
    expect(columnNames(orgTable)).toEqual(['id', 'name', 'description', 'svg_data_url', 'path']);
  });

  it('declares the reservation columns', () => {
    expect(columnNames(reservationTable)).toEqual([
      'id',
      'org_id',
      'item_id',
      'borrower',
      'status',
      'start',
      'end',
      'all_day'
    ]);
  });

  it('declares the org member and position columns', () => {
    expect(columnNames(orgMemberTable)).toEqual(['id', 'user_id', 'org_id']);
    expect(columnNames(orgPositionsTable)).toEqual(['id', 'user_id', 'positions']);
  });

  it('declares the admin columns', () => {
    expect(columnNames(adminTable)).toEqual(['id', 'user_id']);
    expect(columnNames(superAdminTable)).toEqual(['id', 'user_id']);
  });
});

describe('schema enums', () => {
  it('keeps the item status values', () => {
    expect(getTableConfig(itemTable as never).columns[3].enumValues).toEqual(['available', 'booked', 'out_of_service']);
  });

  it('keeps the reservation status values', () => {
    expect(getTableConfig(reservationTable as never).columns[4].enumValues).toEqual([
      'accepted',
      'pending',
      'canceled'
    ]);
  });
});
