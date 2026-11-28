/**
 * @jest-environment node
 */
import { Item } from './Item';
import { fakeDb } from './fake-db';
import { itemTable, orgItemTable } from '@invm/inventory-db-utils';

jest.mock('../db', () => ({ db: require('./fake-db').fakeDb.db }));

const itemRow = { id: 1, name: 'HDMI cable', description: null, status: 'available' };

afterEach(() => {
  jest.clearAllMocks();
  fakeDb.clear();
});

describe('Item.create', () => {
  it('parses the values, inserts the item and the org link, and returns an Item', async () => {
    fakeDb.queue([itemRow], [{ itemId: itemRow.id, orgId: 5 }]);

    const item = await Item.create({ name: 'HDMI cable', description: null }, 5);

    expect(item).toBeInstanceOf(Item);
    expect(item.values).toEqual(itemRow);

    // Both inserts run on the transaction builder, in order.
    const tx = fakeDb.builders[0]!;
    expect(tx.insert).toHaveBeenNthCalledWith(1, itemTable);
    expect(tx.insert).toHaveBeenNthCalledWith(2, orgItemTable);
    expect(tx.values).toHaveBeenNthCalledWith(1, { name: 'HDMI cable', description: null });
    expect(tx.values).toHaveBeenNthCalledWith(2, { itemId: 1, orgId: 5 });
  });

  it('rejects when the partial item fails schema validation', async () => {
    // name is required (min 1 after trim); an empty name must be rejected before any db write.
    await expect(Item.create({ name: '   ', description: null }, 5)).rejects.toMatchObject({
      name: 'ZodError'
    });
    // and no insert should have been attempted
    expect(fakeDb.db.insert).not.toHaveBeenCalled();
  });
});

describe('Item.getByIdAndOrgPath', () => {
  it('returns an Item when a row is found', async () => {
    fakeDb.queue([itemRow]);

    const item = await Item.getByIdAndOrgPath(1, 'org1');

    expect(item).toBeInstanceOf(Item);
    expect(item.values).toEqual(itemRow);
  });

  it('throws a 404 HttpError when no row is found', async () => {
    fakeDb.queue([]);

    await expect(Item.getByIdAndOrgPath(1, 'org1')).rejects.toMatchObject({ status: 404 });
  });
});

describe('Item.getAllGroupByOrgs', () => {
  it('returns the grouped rows', async () => {
    const rows = [{ orgId: 1, items: [itemRow] }, { orgId: 2, items: [] }];
    fakeDb.queue(rows);

    await expect(Item.getAllGroupByOrgs()).resolves.toEqual(rows);
  });
});
