/**
 * @jest-environment node
 */
import { User } from './User';
import { db } from '../db';
import { user } from '@invm/inventory-db-utils';

jest.mock('../db', () => ({
  db: { select: jest.fn() }
}));
jest.mock('@invm/inventory-db-utils', () => ({
  user: { id: 'id', email: 'email' }
}));
jest.mock('drizzle-orm', () => ({
  eq: jest.fn()
}));

describe('User.getById', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns the user with that id', async () => {
    const found = { id: 'u1', email: 'a@x.com' };
    const where = jest.fn().mockResolvedValue([found]);
    const from = jest.fn().mockReturnValue({ where });
    (db.select as jest.Mock).mockReturnValue({ from });

    await expect(User.getById('u1')).resolves.toEqual(found);
    expect(from).toHaveBeenCalledWith(user);
  });

  it('returns undefined when no user has that id', async () => {
    const where = jest.fn().mockResolvedValue([]);
    (db.select as jest.Mock).mockReturnValue({ from: () => ({ where }) });

    await expect(User.getById('ghost')).resolves.toBeUndefined();
  });
});

describe('User.getByEmail', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns the user with that email', async () => {
    const found = { id: 'u1', email: 'a@x.com' };
    const where = jest.fn().mockResolvedValue([found]);
    const from = jest.fn().mockReturnValue({ where });
    (db.select as jest.Mock).mockReturnValue({ from });

    await expect(User.getByEmail('a@x.com')).resolves.toEqual(found);
    expect(from).toHaveBeenCalledWith(user);
  });

  it('returns undefined when no user has that email', async () => {
    const where = jest.fn().mockResolvedValue([]);
    (db.select as jest.Mock).mockReturnValue({ from: () => ({ where }) });

    await expect(User.getByEmail('ghost@x.com')).resolves.toBeUndefined();
  });
});
