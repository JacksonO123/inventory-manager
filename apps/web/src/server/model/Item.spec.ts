/**
 * @jest-environment node
 */
import { Item } from './Item';
import { db } from '../db';

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

describe('Item.return', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('closes the checkout and makes the item available again', async () => {
    const { updateSet } = mockTransaction({ updates: [[{ id: 3 }], []] });

    await expect(Item.return(1)).resolves.toBeUndefined();
    expect(updateSet).toHaveBeenNthCalledWith(1, { returnedAt: expect.any(Date) });
    expect(updateSet).toHaveBeenNthCalledWith(2, { status: 'available' });
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
