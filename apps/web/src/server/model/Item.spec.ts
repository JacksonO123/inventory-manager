/**
 * @jest-environment node
 */
import { ZodError } from 'zod';
import { Item } from './Item';
import { HttpError } from '../errors';
import { db } from '../db';
import { and } from 'drizzle-orm';
import { checkoutTable, itemTable } from '@invm/inventory-db-utils';

jest.mock('../db', () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    transaction: jest.fn()
  }
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
        return {
          where: () => {
            const result = updates.shift() ?? [];
            return Object.assign(Promise.resolve(result), {
              returning: () => Promise.resolve(result)
            });
          }
        };
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
    const input = { name: 'x', description: 'x', is_damaged: false };
    const returning = jest.fn().mockResolvedValue([{ id: 1, ...input }]);
    const values = jest.fn().mockReturnValue({ returning });
    (db.insert as jest.Mock).mockReturnValue({ values });

    await expect(Item.create(input)).resolves.toBeInstanceOf(Item);
    expect(db.insert).toHaveBeenCalled();
    expect(values).toHaveBeenCalledWith(input);
  });

  it('allows creating an item that is already damaged', async () => {
    const input = { name: 'x', description: null, is_damaged: true };
    const returning = jest.fn().mockResolvedValue([{ id: 2, ...input }]);
    const values = jest.fn().mockReturnValue({ returning });
    (db.insert as jest.Mock).mockReturnValue({ values });

    await expect(Item.create(input)).resolves.toBeInstanceOf(Item);
    expect(values).toHaveBeenCalledWith(input);
  });

  it('throws a ZodError for an empty name and never touches the DB', async () => {
    await expect(
      Item.create({ name: '', description: 'x', is_damaged: false })
    ).rejects.toBeInstanceOf(ZodError);
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
    const leftJoin = jest.fn().mockResolvedValue(rows);
    const from = jest.fn().mockReturnValue({ leftJoin });
    (db.select as jest.Mock).mockReturnValue({ from });
    const condition = Symbol('open checkout condition');
    (and as jest.Mock).mockReturnValue(condition);

    await expect(Item.getAll()).resolves.toEqual(rows);
    expect(db.select).toHaveBeenCalled();
    expect(from).toHaveBeenCalledWith(itemTable);
    expect(leftJoin).toHaveBeenCalledWith(checkoutTable, condition);
  });

  it('returns an empty array when no rows exist', async () => {
    const leftJoin = jest.fn().mockResolvedValue([]);
    const from = jest.fn().mockReturnValue({ leftJoin });
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
    const { insertValues, updateSet } = mockTransaction({
      selects: [[{ id: 7 }]],
      updates: [[{ id: 1 }]]
    });

    await expect(Item.checkOut(1, 7)).resolves.toBeUndefined();
    expect(updateSet).toHaveBeenCalledWith({ is_available: false, is_lent_out: true });
    expect(insertValues).toHaveBeenCalledWith({ itemId: 1, borrowerId: 7 });
  });

  it('throws 404 when the borrower does not exist and never touches the item', async () => {
    const { tx } = mockTransaction({ selects: [[]] });

    await expect(Item.checkOut(1, 7)).rejects.toEqual(new HttpError(404, 'Borrower not found'));
    expect(tx.update).not.toHaveBeenCalled();
    expect(tx.insert).not.toHaveBeenCalled();
  });

  it('throws 409 when the item is not available', async () => {
    const { tx } = mockTransaction({ selects: [[{ id: 7 }], [{ id: 1 }]], updates: [[]] });

    await expect(Item.checkOut(1, 7)).rejects.toMatchObject({
      status: 409,
      message: 'Item is not available'
    });
    expect(tx.insert).not.toHaveBeenCalled();
  });

  it('throws 404 when the item does not exist', async () => {
    const { tx } = mockTransaction({ selects: [[{ id: 7 }], []], updates: [[]] });

    await expect(Item.checkOut(1, 7)).rejects.toMatchObject({
      status: 404,
      message: 'Item not found'
    });
    expect(tx.insert).not.toHaveBeenCalled();
  });
});

describe('Item.return', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('closes the checkout and makes the item available again', async () => {
    const { updateSet } = mockTransaction({ updates: [[{ id: 3 }], []] });

    await expect(Item.return(1)).resolves.toBeUndefined();
    expect(updateSet).toHaveBeenNthCalledWith(1, { returnedAt: expect.any(Date) });
    expect(updateSet).toHaveBeenNthCalledWith(2, { is_available: true, is_lent_out: false });
  });

  it('throws 404 when there is no open checkout for the item', async () => {
    const { tx } = mockTransaction({ updates: [[]] });

    await expect(Item.return(1)).rejects.toMatchObject({
      status: 404,
      message: 'Item not found'
    });
    expect(tx.update).toHaveBeenCalledTimes(1);
  });
});

describe('Item.exists', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the main db when no transaction is passed', async () => {
    const limit = jest.fn().mockResolvedValue([{ id: 1 }]);
    (db.select as jest.Mock).mockReturnValue({
      from: () => ({ where: () => ({ limit }) })
    });

    await expect(Item.exists(1)).resolves.toBe(true);
    expect(db.select).toHaveBeenCalled();
  });
});

describe('Item.delete', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  function mockDelete(rows: unknown[]) {
    const returning = jest.fn().mockResolvedValue(rows);
    const where = jest.fn().mockReturnValue({ returning });
    (db.delete as jest.Mock).mockReturnValue({ where });
    return { where, returning };
  }

  it('deletes the item when it exists and is not lent out', async () => {
    jest.spyOn(Item, 'exists').mockResolvedValue(true);
    const { where, returning } = mockDelete([{ id: 1 }]);

    await expect(Item.delete(1)).resolves.toBeUndefined();
    expect(db.delete).toHaveBeenCalledWith(itemTable);
    expect(where).toHaveBeenCalledTimes(1);
    expect(returning).toHaveBeenCalledTimes(1);
  });

  it('throws 404 and does not delete when the item does not exist', async () => {
    jest.spyOn(Item, 'exists').mockResolvedValue(false);

    await expect(Item.delete(999)).rejects.toEqual(new HttpError(404, 'Item not found'));
    expect(db.delete).not.toHaveBeenCalled();
  });

  it('throws 409 when the item exists but the delete removes nothing (lent out)', async () => {
    jest.spyOn(Item, 'exists').mockResolvedValue(true);
    mockDelete([]);

    await expect(Item.delete(1)).rejects.toEqual(new HttpError(409, 'Item is currently lent out'));
  });
});

describe('Item.edit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockUpdate(rows: unknown[]) {
    const returning = jest.fn().mockResolvedValue(rows);
    const where = jest.fn().mockReturnValue({ returning });
    const set = jest.fn().mockReturnValue({ where });
    (db.update as jest.Mock).mockReturnValue({ set });
    return { set, where, returning };
  }

  it('updates only the provided fields', async () => {
    const { set, where } = mockUpdate([{ id: 1 }]);

    await expect(Item.edit(1, { is_damaged: true })).resolves.toBeUndefined();
    expect(db.update).toHaveBeenCalledWith(itemTable);
    expect(set).toHaveBeenCalledWith({ is_damaged: true });
    expect(where).toHaveBeenCalledTimes(1);
  });

  it('allows an admin to edit availability and lent-out fields', async () => {
    const { set } = mockUpdate([{ id: 1 }]);

    await Item.edit(1, { is_available: false, is_lent_out: false });
    expect(set).toHaveBeenCalledWith({ is_available: false, is_lent_out: false });
  });

  it('strips id and unknown keys before updating', async () => {
    const { set } = mockUpdate([{ id: 1 }]);

    await Item.edit(1, { id: 99, name: 'HDMI cable', foo: 'bar' } as never);
    expect(set).toHaveBeenCalledWith({ name: 'HDMI cable' });
  });

  it.each([[{}], [{ id: 5 }], [{ foo: 'bar' }]])(
    'throws 400 and does not update when there are no valid edits (%j)',
    async (values) => {
      await expect(Item.edit(1, values as never)).rejects.toEqual(
        new HttpError(400, 'No valid edits provided')
      );
      expect(db.update).not.toHaveBeenCalled();
    }
  );

  it('rejects invalid values without updating', async () => {
    await expect(Item.edit(1, { name: '   ' })).rejects.toBeInstanceOf(ZodError);
    expect(db.update).not.toHaveBeenCalled();
  });

  it('throws 404 when no item matches the id', async () => {
    mockUpdate([]);

    await expect(Item.edit(999, { name: 'HDMI cable' })).rejects.toEqual(
      new HttpError(404, 'Item not found')
    );
  });
});
