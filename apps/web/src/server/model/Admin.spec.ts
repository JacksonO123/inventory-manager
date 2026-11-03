/**
 * @jest-environment node
 */
import { Admin, AdminWithEmail } from './Admin';
import { db } from '../db';
import { adminTable } from '@invm/inventory-db-utils';

jest.mock('../db', () => ({
  db: { insert: jest.fn(), select: jest.fn(), delete: jest.fn() }
}));
jest.mock('@invm/inventory-db-utils', () => ({
  adminTable: { id: 'id', user_id: 'user_id' },
  user: { id: 'id', email: 'email' }
}));
jest.mock('drizzle-orm', () => ({
  eq: jest.fn()
}));

describe('Admin.create', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('creates an admin for the user and returns it', async () => {
    const returning = jest.fn().mockResolvedValue([{ id: 1, user_id: 'u1' }]);
    const values = jest.fn().mockReturnValue({ returning });
    (db.insert as jest.Mock).mockReturnValue({ values });

    const admin = await Admin.create('u1');

    expect(admin).toBeInstanceOf(Admin);
    expect(admin.values).toEqual({ id: 1, user_id: 'u1' });
    expect(db.insert).toHaveBeenCalledWith(adminTable);
    expect(values).toHaveBeenCalledWith({ user_id: 'u1' });
  });

  it('throws when the DB returns no row', async () => {
    const returning = jest.fn().mockResolvedValue([]);
    (db.insert as jest.Mock).mockReturnValue({ values: jest.fn().mockReturnValue({ returning }) });

    await expect(Admin.create('u1')).rejects.toThrow('Failed to create new admin');
  });
});

describe('Admin.isAdmin', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns true when the DB finds an admin row', async () => {
    const where = jest.fn().mockResolvedValue([{ id: 1 }]);
    (db.select as jest.Mock).mockReturnValue({ from: () => ({ where }) });

    await expect(Admin.isAdmin('u1')).resolves.toBe(true);
  });

  it('returns false when the DB finds no admin row', async () => {
    const where = jest.fn().mockResolvedValue([]);
    (db.select as jest.Mock).mockReturnValue({ from: () => ({ where }) });

    await expect(Admin.isAdmin('u1')).resolves.toBe(false);
  });
});

describe('Admin.revoke', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('deletes the admin row from the admin table', async () => {
    const where = jest.fn().mockResolvedValue(undefined);
    (db.delete as jest.Mock).mockReturnValue({ where });

    await expect(Admin.revoke('u1')).resolves.toBeUndefined();
    expect(db.delete).toHaveBeenCalledWith(adminTable);
    expect(where).toHaveBeenCalled();
  });
});

describe('Admin.getByUserId', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns the admin row for that user', async () => {
    const where = jest.fn().mockResolvedValue([{ id: 1, user_id: 'u1' }]);
    (db.select as jest.Mock).mockReturnValue({ from: () => ({ where }) });

    await expect(Admin.getByUserId('u1')).resolves.toEqual({ id: 1, user_id: 'u1' });
  });
});

describe('AdminWithEmail.getAll', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns every admin with their email', async () => {
    const innerJoin = jest.fn().mockResolvedValue([
      { id: 1, user_id: 'u1', email: 'a@x.com' },
      { id: 2, user_id: 'u2', email: 'b@x.com' }
    ]);
    const from = jest.fn().mockReturnValue({ innerJoin });
    (db.select as jest.Mock).mockReturnValue({ from });

    const admins = await AdminWithEmail.getAll();

    expect(admins).toHaveLength(2);
    expect(admins[0]).toBeInstanceOf(AdminWithEmail);
    expect(admins[0]?.values).toEqual({ id: 1, user_id: 'u1' });
    expect(admins[0]?.email).toBe('a@x.com');
    expect(admins[1]?.email).toBe('b@x.com');
    expect(from).toHaveBeenCalledWith(adminTable);
  });
});
