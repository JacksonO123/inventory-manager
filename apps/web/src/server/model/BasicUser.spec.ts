/**
 * @jest-environment node
 */
import { BasicUser } from './BasicUser';
import { db } from '../db';
import { basicUserTable } from '@invm/inventory-db-utils';

jest.mock('../db', () => ({
  db: { insert: jest.fn(), selectDistinct: jest.fn() }
}));
jest.mock('@invm/inventory-db-utils', () => ({
  basicUserTable: { id: 'id', email: 'email' }
}));
jest.mock('drizzle-orm', () => ({
  eq: jest.fn()
}));

describe('BasicUser.create', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('creates the user and returns their id', async () => {
    const input = { name: 'Ben', email: 'ben@x.com' } as any;
    const returning = jest.fn().mockResolvedValue([{ id: 'u1' }]);
    const values = jest.fn().mockReturnValue({ returning });
    (db.insert as jest.Mock).mockReturnValue({ values });

    await expect(BasicUser.create(input)).resolves.toBe('u1');
    expect(db.insert).toHaveBeenCalledWith(basicUserTable);
    expect(values).toHaveBeenCalledWith(input);
  });

  it('throws when the DB returns no row', async () => {
    const returning = jest.fn().mockResolvedValue([]);
    (db.insert as jest.Mock).mockReturnValue({ values: jest.fn().mockReturnValue({ returning }) });

    await expect(BasicUser.create({ email: 'ben@x.com' } as any)).rejects.toThrow(
      'Failed to create user'
    );
  });
});

describe('BasicUser.getByEmail', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns the user with that email', async () => {
    const user = { id: 'u1', email: 'ben@x.com' };
    const limit = jest.fn().mockResolvedValue([user]);
    (db.selectDistinct as jest.Mock).mockReturnValue({
      from: () => ({ where: () => ({ limit }) })
    });

    await expect(BasicUser.getByEmail('ben@x.com')).resolves.toEqual(user);
    expect(limit).toHaveBeenCalledWith(1);
  });

  it('returns null when nobody has that email', async () => {
    const limit = jest.fn().mockResolvedValue([]);
    (db.selectDistinct as jest.Mock).mockReturnValue({
      from: () => ({ where: () => ({ limit }) })
    });

    await expect(BasicUser.getByEmail('ghost@x.com')).resolves.toBeNull();
  });
});
