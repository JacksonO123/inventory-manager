/**
 * @jest-environment node
 */
import { OrgPositions } from './OrgPositions';
import { fakeDb } from './fake-db';
import { orgPositionsTable } from '@invm/inventory-db-utils';

jest.mock('../db', () => ({ db: require('./fake-db').fakeDb.db }));

afterEach(() => {
  jest.clearAllMocks();
  fakeDb.clear();
});

describe('OrgPositions.getByUserId', () => {
  it('returns the stored positions when a row exists', async () => {
    fakeDb.queue([{ id: 1, userId: 'u1', positions: [3, 1, 2] }]);

    const positions = await OrgPositions.getByUserId('u1');

    expect(positions).toBeInstanceOf(OrgPositions);
    expect(positions.values).toEqual({ id: 1, userId: 'u1', positions: [3, 1, 2] });
  });

  it('returns a default empty OrgPositions when no row exists', async () => {
    fakeDb.queue([]);

    const positions = await OrgPositions.getByUserId('u1');

    expect(positions.values).toEqual({ id: -1, userId: 'u1', positions: [] });
  });
});

describe('OrgPositions.updateByUserId', () => {
  it('upserts the positions for the user', async () => {
    fakeDb.queue([{ id: 1 }]);
    await OrgPositions.updateByUserId('u1', [1, 2, 3]);

    expect(fakeDb.db.insert).toHaveBeenCalledWith(orgPositionsTable);
    expect(fakeDb.lastBuilder.values).toHaveBeenCalledWith({ userId: 'u1', positions: [1, 2, 3] });
    expect(fakeDb.lastBuilder.onConflictDoUpdate).toHaveBeenCalledWith({
      target: orgPositionsTable.userId,
      set: { positions: [1, 2, 3] }
    });
  });
});
