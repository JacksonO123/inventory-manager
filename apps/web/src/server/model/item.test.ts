/**
 * @jest-environment node
 */
import { ZodError } from 'zod';
import { Item } from './Item';
import { db } from '../db';
import { itemTable } from '@invm/inventory-db-utils';

jest.mock('../db', () => ({
  db: { insert: jest.fn(), select: jest.fn(), transaction: jest.fn() }
}));
jest.mock('@invm/inventory-db-utils', () => ({
  itemTable: {},
  basicUserTable: {},
  checkoutTable: {}
}));
jest.mock('drizzle-orm', () => ({
  and: jest.fn(),
  eq: jest.fn(),
  isNull: jest.fn()
}));

// fake transaction: each select / update call resolves with the next queued result
function mockTransaction({
  selects = [],
  updates = []
}: {
  selects?: unknown[][];
  updates?: unknown[][];
}) {
  const insertValues = jest.fn().mockResolvedValue(undefined);
  const updateSet = jest.fn();
  const tx = {
    select: jest.fn(() => ({
      from: () => ({ where: () => ({ limit: () => Promise.resolve(selects.shift() ?? []) }) })
    })),
    update: jest.fn(() => ({
      set: (values: unknown) => {
        updateSet(values);
        return { where: () => ({ returning: () => Promise.resolve(updates.shift() ?? []) }) };
      }
    })),
    insert: jest.fn(() => ({ values: insertValues }))
  };
  (db.transaction as jest.Mock).mockImplementation((cb: (t: typeof tx) => unknown) => cb(tx));
  return { tx, insertValues, updateSet };
}

describe('Item.create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('valid create', async () => {
    const input = { name: 'x', description: 'x' };
    const returning = jest.fn().mockResolvedValue([{ id: 1, ...input }]);
    const values = jest.fn().mockReturnValue({ returning });
    (db.insert as jest.Mock).mockReturnValue({ values });

    await expect(Item.create(input)).resolves.toBeInstanceOf(Item);
    expect(db.insert).toHaveBeenCalled();
    expect(values).toHaveBeenCalledWith(input);
  });

  it('throws a ZodError for an empty name and never touches the DB', async () => {
    await expect(Item.create({ name: '', description: 'x' })).rejects.toBeInstanceOf(ZodError);
    expect(db.insert).not.toHaveBeenCalled();
  });
});

describe('Item.getAll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the rows selected from the item table', async () => {
    const rows = [
      { id: 1, name: 'a', description: 'a' },
      { id: 2, name: 'b', description: 'b' }
    ];
    const from = jest.fn().mockResolvedValue(rows);
    (db.select as jest.Mock).mockReturnValue({ from });

    await expect(Item.getAll()).resolves.toEqual(rows);
    expect(db.select).toHaveBeenCalled();
    expect(from).toHaveBeenCalledWith(itemTable);
  });

  it('returns an empty array when no rows exist', async () => {
    const from = jest.fn().mockResolvedValue([]);
    (db.select as jest.Mock).mockReturnValue({ from });

    await expect(Item.getAll()).resolves.toEqual([]);
    expect(db.select).toHaveBeenCalled();
  });
});

describe('Item.checkOut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('books an available item and records the checkout', async () => {
    const booked = { id: 1, name: 'x', description: null, status: 'booked' };
    const { insertValues, updateSet } = mockTransaction({
      selects: [[{ id: 7 }]],
      updates: [[booked]]
    });

    const result = await Item.checkOut(1, 7);

    expect(result).toEqual({ ok: true, item: new Item(booked as never) });
    expect(updateSet).toHaveBeenCalledWith({ status: 'booked' });
    expect(insertValues).toHaveBeenCalledWith({ itemId: 1, borrowerId: 7 });
  });

  it('fails when the borrower does not exist and never touches the item', async () => {
    const { tx } = mockTransaction({ selects: [[]] });

    await expect(Item.checkOut(1, 7)).resolves.toEqual({
      ok: false,
      reason: 'borrower_not_found'
    });
    expect(tx.update).not.toHaveBeenCalled();
    expect(tx.insert).not.toHaveBeenCalled();
  });

  it('fails when the item is not available', async () => {
    const { tx } = mockTransaction({ selects: [[{ id: 7 }], [{ id: 1 }]], updates: [[]] });

    await expect(Item.checkOut(1, 7)).resolves.toEqual({ ok: false, reason: 'not_available' });
    expect(tx.insert).not.toHaveBeenCalled();
  });

  it('fails when the item does not exist', async () => {
    const { tx } = mockTransaction({ selects: [[{ id: 7 }], []], updates: [[]] });

    await expect(Item.checkOut(1, 7)).resolves.toEqual({ ok: false, reason: 'item_not_found' });
    expect(tx.insert).not.toHaveBeenCalled();
  });
});

describe('Item.return', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('closes the checkout and makes the item available again', async () => {
    const available = { id: 1, name: 'x', description: null, status: 'available' };
    const { updateSet } = mockTransaction({ updates: [[{ id: 3 }], [available]] });

    const result = await Item.return(1, 7);

    expect(result).toEqual({ ok: true, item: new Item(available as never) });
    expect(updateSet).toHaveBeenNthCalledWith(1, { returnedAt: expect.any(Date) });
    expect(updateSet).toHaveBeenNthCalledWith(2, { status: 'available' });
  });

  it('fails when the item is not checked out by this borrower', async () => {
    const { tx } = mockTransaction({ updates: [[]], selects: [[{ id: 1 }]] });

    await expect(Item.return(1, 7)).resolves.toEqual({ ok: false, reason: 'not_checked_out' });
    expect(tx.update).toHaveBeenCalledTimes(1);
  });

  it('fails when the item does not exist', async () => {
    mockTransaction({ updates: [[]], selects: [[]] });

    await expect(Item.return(1, 7)).resolves.toEqual({ ok: false, reason: 'item_not_found' });
  });
});
