/**
 * @jest-environment node
 */
import { SuperAdmin, SuperAdminWithEmail } from './SuperAdmin';
import { db } from '../db';
import { superAdminTable } from '@invm/inventory-db-utils';

jest.mock('../db', () => ({
  db: { insert: jest.fn(), select: jest.fn(), delete: jest.fn() }
}));
jest.mock('@invm/inventory-db-utils', () => ({
  superAdminTable: { id: 'id', user_id: 'user_id' },
  user: { id: 'id', email: 'email' }
}));
jest.mock('drizzle-orm', () => ({
  eq: jest.fn()
}));

describe('SuperAdmin.create', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('creates a super admin for the user and returns it', async () => {
    const returning = jest.fn().mockResolvedValue([{ id: 1, user_id: 'u1' }]);
    const values = jest.fn().mockReturnValue({ returning });
    (db.insert as jest.Mock).mockReturnValue({ values });

    const superAdmin = await SuperAdmin.create('u1');

    expect(superAdmin).toBeInstanceOf(SuperAdmin);
    expect(superAdmin.values).toEqual({ id: 1, user_id: 'u1' });
    expect(db.insert).toHaveBeenCalledWith(superAdminTable);
    expect(values).toHaveBeenCalledWith({ user_id: 'u1' });
  });

  it('throws when the DB returns no row', async () => {
    const returning = jest.fn().mockResolvedValue([]);
    (db.insert as jest.Mock).mockReturnValue({ values: jest.fn().mockReturnValue({ returning }) });

    await expect(SuperAdmin.create('u1')).rejects.toThrow('Failed to create super admin');
  });
});

describe('SuperAdmin.isSuperAdmin', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns true when the DB finds a super admin row', async () => {
    const where = jest.fn().mockResolvedValue([{ id: 1 }]);
    (db.select as jest.Mock).mockReturnValue({ from: () => ({ where }) });

    await expect(SuperAdmin.isSuperAdmin('u1')).resolves.toBe(true);
  });

  it('returns false when the DB finds no super admin row', async () => {
    const where = jest.fn().mockResolvedValue([]);
    (db.select as jest.Mock).mockReturnValue({ from: () => ({ where }) });

    await expect(SuperAdmin.isSuperAdmin('u1')).resolves.toBe(false);
  });
});

describe('SuperAdmin.revoke', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('deletes the row from the super admin table', async () => {
    const where = jest.fn().mockResolvedValue(undefined);
    (db.delete as jest.Mock).mockReturnValue({ where });

    await expect(SuperAdmin.revoke('u1')).resolves.toBeUndefined();
    expect(db.delete).toHaveBeenCalledWith(superAdminTable);
    expect(where).toHaveBeenCalled();
  });
});

describe('SuperAdmin.getByUserId', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns the super admin row for that user', async () => {
    const where = jest.fn().mockResolvedValue([{ id: 1, user_id: 'u1' }]);
    (db.select as jest.Mock).mockReturnValue({ from: () => ({ where }) });

    await expect(SuperAdmin.getByUserId('u1')).resolves.toEqual({ id: 1, user_id: 'u1' });
  });
});

describe('SuperAdminWithEmail.getAll', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns every super admin with their email', async () => {
    const innerJoin = jest.fn().mockResolvedValue([
      { id: 1, user_id: 'u1', email: 'a@x.com' },
      { id: 2, user_id: 'u2', email: 'b@x.com' }
    ]);
    const from = jest.fn().mockReturnValue({ innerJoin });
    (db.select as jest.Mock).mockReturnValue({ from });

    const superAdmins = await SuperAdminWithEmail.getAll();

    expect(superAdmins).toHaveLength(2);
    expect(superAdmins[0]).toBeInstanceOf(SuperAdminWithEmail);
    expect(superAdmins[0]?.values).toEqual({ id: 1, user_id: 'u1' });
    expect(superAdmins[0]?.email).toBe('a@x.com');
    expect(superAdmins[1]?.email).toBe('b@x.com');
    expect(from).toHaveBeenCalledWith(superAdminTable);
  });
});
