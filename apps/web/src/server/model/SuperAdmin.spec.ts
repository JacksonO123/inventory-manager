/**
 * @jest-environment node
 */
import { SuperAdmin, SuperAdminWithEmail } from './SuperAdmin';
import { fakeDb } from './fake-db';
import { superAdminTable } from '@invm/inventory-db-utils';

jest.mock('../db', () => ({ db: require('./fake-db').fakeDb.db }));

const superAdminRow = { id: 1, userId: 'u1' };

afterEach(() => {
  jest.clearAllMocks();
  fakeDb.clear();
});

describe('SuperAdmin.create', () => {
  it('returns a SuperAdmin wrapping the inserted row', async () => {
    fakeDb.queue([superAdminRow]);
    const sa = await SuperAdmin.create('u1');
    expect(sa).toBeInstanceOf(SuperAdmin);
    expect(sa.values).toEqual(superAdminRow);
  });
});

describe('SuperAdmin.isSuperAdmin', () => {
  it('returns true when a row exists', async () => {
    fakeDb.queue([{ id: 1 }]);
    await expect(SuperAdmin.isSuperAdmin('u1')).resolves.toBe(true);
  });

  it('returns false when no row exists', async () => {
    fakeDb.queue([]);
    await expect(SuperAdmin.isSuperAdmin('u1')).resolves.toBe(false);
  });
});

describe('SuperAdmin.isSuperAdminByEmail', () => {
  it('returns true when a row exists', async () => {
    fakeDb.queue([{ id: 1 }]);
    await expect(SuperAdmin.isSuperAdminByEmail('a@b.com')).resolves.toBe(true);
  });

  it('returns false when no row exists', async () => {
    fakeDb.queue([]);
    await expect(SuperAdmin.isSuperAdminByEmail('a@b.com')).resolves.toBe(false);
  });
});

describe('SuperAdmin.revoke', () => {
  it('deletes only the super admin row for the user', async () => {
    fakeDb.queue([]);
    await SuperAdmin.revoke('u1');

    expect(fakeDb.db.delete).toHaveBeenCalledWith(superAdminTable);
    expect(fakeDb.render(fakeDb.lastWhere)).toEqual({
      sql: '"super_admin"."user_id" = $1',
      params: ['u1']
    });
  });
});

describe('SuperAdmin.getByUserId', () => {
  it('returns the raw row (not wrapped) when found', async () => {
    fakeDb.queue([superAdminRow]);
    await expect(SuperAdmin.getByUserId('u1')).resolves.toEqual(superAdminRow);
  });

  it('returns undefined when not found', async () => {
    fakeDb.queue([]);
    await expect(SuperAdmin.getByUserId('missing')).resolves.toBeUndefined();
  });
});

describe('SuperAdminWithEmail.getAll', () => {
  it('maps each row to a SuperAdminWithEmail', async () => {
    fakeDb.queue([{ id: 1, userId: 'u1', email: 'a@b.com' }]);

    const sas = await SuperAdminWithEmail.getAll();

    expect(sas).toHaveLength(1);
    expect(sas[0]).toBeInstanceOf(SuperAdminWithEmail);
    expect(sas[0]!.values).toEqual({ id: 1, userId: 'u1' });
    expect(sas[0]!.email).toBe('a@b.com');
  });
});
