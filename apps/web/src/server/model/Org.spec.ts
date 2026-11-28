/**
 * @jest-environment node
 */
import { Org } from './Org';
import { Item } from './Item';
import { fakeDb } from './fake-db';
import { orgTable } from '@invm/inventory-db-utils';

jest.mock('../db', () => ({ db: require('./fake-db').fakeDb.db }));

const orgRow = { id: 1, name: 'org1', description: 'd', svgDataUrl: null, path: 'org1' };
const itemRow = { id: 10, name: 'A', description: null, status: 'available' };

afterEach(() => {
  jest.clearAllMocks();
  fakeDb.clear();
});

describe('Org.getAll', () => {
  it('returns the org rows', async () => {
    fakeDb.queue([orgRow]);
    await expect(Org.getAll()).resolves.toEqual([orgRow]);
  });
});

describe('Org.create', () => {
  it('inserts the org on the transaction and returns an Org wrapping the inserted row', async () => {
    fakeDb.queue([orgRow]);

    const org = await Org.create({ name: 'org1', description: 'd', svgDataUrl: null, path: 'org1' });

    expect(org).toBeInstanceOf(Org);
    expect(org.values).toEqual(orgRow);

    // The insert runs on the transaction builder (not the outer db).
    const tx = fakeDb.builders[0]!;
    expect(tx.insert).toHaveBeenCalledWith(orgTable);
    expect(tx.values).toHaveBeenCalledWith({
      name: 'org1',
      description: 'd',
      svgDataUrl: null,
      path: 'org1'
    });
  });
});

describe('Org.update', () => {
  it('updates only the org row by id and returns the updated row', async () => {
    const updated = { ...orgRow, name: 'renamed' };
    fakeDb.queue([updated]);

    const org = await Org.update(orgRow);
    expect(org.values).toEqual(updated);

    expect(fakeDb.db.update).toHaveBeenCalledWith(orgTable);
    expect(fakeDb.lastBuilder.set).toHaveBeenCalledWith({
      name: 'org1',
      description: 'd',
      svgDataUrl: null,
      path: 'org1'
    });
    expect(fakeDb.render(fakeDb.lastWhere)).toEqual({
      sql: '"organization"."id" = $1',
      params: [1]
    });
  });
});

describe('Org.deleteById', () => {
  it('deletes only the org row by id', async () => {
    fakeDb.queue([{ id: 1 }]);
    await Org.deleteById(1);

    expect(fakeDb.db.delete).toHaveBeenCalledWith(orgTable);
    expect(fakeDb.render(fakeDb.lastWhere)).toEqual({
      sql: '"organization"."id" = $1',
      params: [1]
    });
  });

  it('throws when no row is deleted', async () => {
    fakeDb.queue([]);
    await expect(Org.deleteById(1)).rejects.toMatchObject({ message: 'Failed to delete org' });
  });
});

describe('Org.getByPath', () => {
  it('returns an Org when found', async () => {
    fakeDb.queue([orgRow]);
    const org = await Org.getByPath('org1');
    expect(org.values).toEqual(orgRow);
  });

  it('throws a 404 when not found', async () => {
    fakeDb.queue([]);
    await expect(Org.getByPath('missing')).rejects.toMatchObject({ status: 404 });
  });
});

describe('Org.getInfoFromAdminUserId', () => {
  it('maps each row to { org, items } model instances', async () => {
    fakeDb.queue([{ org: orgRow, items: [itemRow] }, { org: { ...orgRow, id: 2, path: 'org2' }, items: [] }]);

    const info = await Org.getInfoFromAdminUserId('u1');

    expect(info).toHaveLength(2);
    expect(info[0]!.org).toBeInstanceOf(Org);
    expect(info[0]!.org.values).toEqual(orgRow);
    expect(info[0]!.items).toHaveLength(1);
    expect(info[0]!.items[0]!).toBeInstanceOf(Item);
    expect(info[0]!.items[0]!.values).toEqual(itemRow);
    expect(info[1]!.items).toEqual([]);
  });
});

describe('Org.getOrgsForAdminUserId', () => {
  it('maps each row to an Org instance', async () => {
    fakeDb.queue([{ org: orgRow }]);

    const orgs = await Org.getOrgsForAdminUserId('u1');

    expect(orgs).toHaveLength(1);
    expect(orgs[0]).toBeInstanceOf(Org);
    expect(orgs[0]!.values).toEqual(orgRow);
  });
});
