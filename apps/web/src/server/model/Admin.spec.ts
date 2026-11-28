/**
 * @jest-environment node
 */
import { Admin, AdminWithEmail } from './Admin';
import { fakeDb } from './fake-db';
import { adminTable } from '@invm/inventory-db-utils';

jest.mock('../db', () => ({ db: require('./fake-db').fakeDb.db }));

const adminRow = { id: 1, userId: 'u1' };

afterEach(() => {
  jest.clearAllMocks();
  fakeDb.clear();
});

describe('Admin.create', () => {
  it('returns an Admin wrapping the inserted row', async () => {
    fakeDb.queue([adminRow]);
    const admin = await Admin.create('u1');
    expect(admin).toBeInstanceOf(Admin);
    expect(admin.values).toEqual(adminRow);
  });
});

describe('Admin.isAdmin', () => {
  it('returns true when an admin row exists', async () => {
    fakeDb.queue([{ id: 1 }]);
    await expect(Admin.isAdmin('u1')).resolves.toBe(true);
  });

  it('returns false when no admin row exists', async () => {
    fakeDb.queue([]);
    await expect(Admin.isAdmin('u1')).resolves.toBe(false);
  });
});

describe('Admin.revoke', () => {
  it('deletes only the admin row for the user', async () => {
    fakeDb.queue([]);
    await Admin.revoke('u1');

    expect(fakeDb.db.delete).toHaveBeenCalledWith(adminTable);
    expect(fakeDb.render(fakeDb.lastWhere)).toEqual({
      sql: '"admin"."user_id" = $1',
      params: ['u1']
    });
  });
});

describe('Admin.getByUserId', () => {
  it('returns an Admin when found', async () => {
    fakeDb.queue([adminRow]);
    const admin = await Admin.getByUserId('u1');
    expect(admin?.values).toEqual(adminRow);
  });

  it('returns undefined when not found', async () => {
    fakeDb.queue([]);
    await expect(Admin.getByUserId('missing')).resolves.toBeUndefined();
  });
});

describe('Admin.isAdminByEmail', () => {
  it('returns true when a row exists', async () => {
    fakeDb.queue([{ id: 'u1' }]);
    await expect(Admin.isAdminByEmail('a@b.com')).resolves.toBe(true);
  });

  it('returns false when no row exists', async () => {
    fakeDb.queue([]);
    await expect(Admin.isAdminByEmail('a@b.com')).resolves.toBe(false);
  });
});

describe('Admin.getByUserEmail', () => {
  it('returns an Admin wrapping the joined row when found', async () => {
    fakeDb.queue([{ admin: adminRow }]);
    const admin = await Admin.getByUserEmail('a@b.com');
    expect(admin?.values).toEqual(adminRow);
  });

  it('returns undefined when not found', async () => {
    fakeDb.queue([]);
    await expect(Admin.getByUserEmail('missing@b.com')).resolves.toBeUndefined();
  });
});

describe('AdminWithEmail.getAll', () => {
  it('maps each row to an AdminWithEmail', async () => {
    fakeDb.queue([{ id: 1, userId: 'u1', email: 'a@b.com' }]);

    const admins = await AdminWithEmail.getAll();

    expect(admins).toHaveLength(1);
    expect(admins[0]).toBeInstanceOf(AdminWithEmail);
    expect(admins[0]!.values).toEqual({ id: 1, userId: 'u1' });
    expect(admins[0]!.email).toBe('a@b.com');
  });
});

describe('AdminWithEmail.getMembersOfOrgByPath', () => {
  it('maps each row to an AdminWithEmail', async () => {
    fakeDb.queue([{ id: 1, userId: 'u1', email: 'a@b.com' }]);

    const members = await AdminWithEmail.getMembersOfOrgByPath('org1');

    expect(members[0]).toBeInstanceOf(AdminWithEmail);
    expect(members[0]!.email).toBe('a@b.com');
  });
});
