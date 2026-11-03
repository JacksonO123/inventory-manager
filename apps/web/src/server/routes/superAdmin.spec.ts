/**
 * @jest-environment node
 */
import { superAdminRoute } from './superAdmin';
import { auth } from '../auth';
import { User } from '../model/User';
import { Admin } from '../model/Admin';
import { SuperAdmin, SuperAdminWithEmail } from '../model/SuperAdmin';

jest.mock('../auth', () => ({ auth: { api: { getSession: jest.fn() } } }));
jest.mock('../model/User', () => ({ User: { getById: jest.fn(), getByEmail: jest.fn() } }));
jest.mock('../model/Admin', () => ({
  Admin: { isAdmin: jest.fn(), create: jest.fn() }
}));
jest.mock('../model/SuperAdmin', () => ({
  SuperAdmin: {
    isSuperAdmin: jest.fn(),
    create: jest.fn(),
    revoke: jest.fn(),
    getByUserId: jest.fn()
  },
  SuperAdminWithEmail: { getAll: jest.fn() }
}));

const getSession = auth.api.getSession as unknown as jest.Mock;

const req = { headers: {} };
const route = superAdminRoute as any;
const unauthorized = { status: 401, body: { message: '401 unauthorized' } };

function loginAsSuperAdmin() {
  getSession.mockResolvedValue({
    session: {},
    user: { id: 'boss', email: 'boss@x.com' }
  });
  (SuperAdmin.isSuperAdmin as jest.Mock).mockResolvedValue(true);
}

function loginAsRegularUser() {
  getSession.mockResolvedValue({
    session: {},
    user: { id: 'caller', email: 'caller@x.com' }
  });
  (SuperAdmin.isSuperAdmin as jest.Mock).mockResolvedValue(false);
}

describe('superAdminRoute.isSuperAdmin', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('lets a super admin ask about anyone and returns their super admin status', async () => {
    getSession.mockResolvedValue({ session: {}, user: { id: 'boss', email: 'boss@x.com' } });
    (SuperAdmin.isSuperAdmin as jest.Mock).mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    (User.getById as jest.Mock).mockResolvedValue({ id: 'other', email: 'other@x.com' });

    await expect(route.isSuperAdmin({ body: { id: 'other' }, req })).resolves.toEqual({
      status: 200,
      body: { isAdmin: false }
    });
  });

  it('tells a regular user asking about themselves (same email) they are not a super admin', async () => {
    loginAsRegularUser();
    (User.getById as jest.Mock).mockResolvedValue({ id: 'caller', email: 'caller@x.com' });

    await expect(route.isSuperAdmin({ body: { id: 'caller' }, req })).resolves.toEqual({
      status: 200,
      body: { isAdmin: false }
    });
  });

  it('returns 401 when there is no session', async () => {
    getSession.mockResolvedValue(null);

    await expect(route.isSuperAdmin({ body: { id: 'u1' }, req })).resolves.toEqual(unauthorized);
  });

  it('returns 401 when the queried user does not exist', async () => {
    loginAsSuperAdmin();
    (User.getById as jest.Mock).mockResolvedValue(undefined);

    await expect(route.isSuperAdmin({ body: { id: 'ghost' }, req })).resolves.toEqual(unauthorized);
  });

  it('returns 401 when a regular user asks about someone else (different email)', async () => {
    loginAsRegularUser();
    (User.getById as jest.Mock).mockResolvedValue({ id: 'other', email: 'other@x.com' });

    await expect(route.isSuperAdmin({ body: { id: 'other' }, req })).resolves.toEqual(unauthorized);
  });

  it('returns 500 when something throws', async () => {
    loginAsSuperAdmin();
    (User.getById as jest.Mock).mockRejectedValue(new Error('db down'));

    await expect(route.isSuperAdmin({ body: { id: 'u1' }, req })).resolves.toEqual({
      status: 500,
      body: { message: 'Error: db down' }
    });
  });
});

describe('superAdminRoute.isValidSuperAdminEmail', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns success when the user exists and is not a super admin yet', async () => {
    getSession.mockResolvedValue({ session: {}, user: { id: 'boss', email: 'boss@x.com' } });
    (SuperAdmin.isSuperAdmin as jest.Mock).mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    (User.getByEmail as jest.Mock).mockResolvedValue({ id: 'u1' });

    await expect(route.isValidSuperAdminEmail({ body: { email: 'a@x.com' }, req })).resolves.toEqual({
      status: 200,
      body: { status: 'success' }
    });
  });

  it('returns no_user_exists when no user has that email', async () => {
    loginAsSuperAdmin();
    (User.getByEmail as jest.Mock).mockResolvedValue(undefined);

    await expect(route.isValidSuperAdminEmail({ body: { email: 'ghost@x.com' }, req })).resolves.toEqual({
      status: 200,
      body: { status: 'no_user_exists' }
    });
  });

  it('returns super_admin_exists when that user is already a super admin', async () => {
    loginAsSuperAdmin();
    (User.getByEmail as jest.Mock).mockResolvedValue({ id: 'u1' });

    await expect(route.isValidSuperAdminEmail({ body: { email: 'a@x.com' }, req })).resolves.toEqual({
      status: 200,
      body: { status: 'super_admin_exists' }
    });
  });

  it('returns 401 when there is no session', async () => {
    getSession.mockResolvedValue(null);

    await expect(route.isValidSuperAdminEmail({ body: { email: 'a@x.com' }, req })).resolves.toEqual(unauthorized);
  });

  it('returns 401 when the caller is not a super admin', async () => {
    loginAsRegularUser();

    await expect(route.isValidSuperAdminEmail({ body: { email: 'a@x.com' }, req })).resolves.toEqual(unauthorized);
    expect(User.getByEmail).not.toHaveBeenCalled();
  });

  it('returns 500 when something throws', async () => {
    loginAsSuperAdmin();
    (User.getByEmail as jest.Mock).mockRejectedValue(new Error('db down'));

    await expect(route.isValidSuperAdminEmail({ body: { email: 'a@x.com' }, req })).resolves.toEqual({
      status: 500,
      body: { message: 'Error: db down' }
    });
  });
});

describe('superAdminRoute.isValidAdminEmail', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns success when the user exists and is not an admin yet', async () => {
    loginAsSuperAdmin();
    (User.getByEmail as jest.Mock).mockResolvedValue({ id: 'u1' });
    (Admin.isAdmin as jest.Mock).mockResolvedValue(false);

    await expect(route.isValidAdminEmail({ body: { email: 'a@x.com' }, req })).resolves.toEqual({
      status: 200,
      body: { status: 'success' }
    });
  });

  it('returns no_user_exists when no user has that email', async () => {
    loginAsSuperAdmin();
    (User.getByEmail as jest.Mock).mockResolvedValue(undefined);

    await expect(route.isValidAdminEmail({ body: { email: 'ghost@x.com' }, req })).resolves.toEqual({
      status: 200,
      body: { status: 'no_user_exists' }
    });
  });

  it('returns admin_exists when that user is already an admin', async () => {
    loginAsSuperAdmin();
    (User.getByEmail as jest.Mock).mockResolvedValue({ id: 'u1' });
    (Admin.isAdmin as jest.Mock).mockResolvedValue(true);

    await expect(route.isValidAdminEmail({ body: { email: 'a@x.com' }, req })).resolves.toEqual({
      status: 200,
      body: { status: 'admin_exists' }
    });
  });

  it('returns 401 when there is no session', async () => {
    getSession.mockResolvedValue(null);

    await expect(route.isValidAdminEmail({ body: { email: 'a@x.com' }, req })).resolves.toEqual(unauthorized);
  });

  it('returns 401 when the caller is not a super admin', async () => {
    loginAsRegularUser();

    await expect(route.isValidAdminEmail({ body: { email: 'a@x.com' }, req })).resolves.toEqual(unauthorized);
    expect(User.getByEmail).not.toHaveBeenCalled();
  });

  it('returns 500 when something throws', async () => {
    loginAsSuperAdmin();
    (User.getByEmail as jest.Mock).mockRejectedValue(new Error('db down'));

    await expect(route.isValidAdminEmail({ body: { email: 'a@x.com' }, req })).resolves.toEqual({
      status: 500,
      body: { message: 'Error: db down' }
    });
  });
});

describe('superAdminRoute.addSuperAdmin', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('creates a super admin for the email and returns its ids', async () => {
    loginAsSuperAdmin();
    (User.getByEmail as jest.Mock).mockResolvedValue({ id: 'u1' });
    (SuperAdmin.create as jest.Mock).mockResolvedValue({ values: { id: 7, user_id: 'u1' } });

    await expect(route.addSuperAdmin({ body: { email: 'a@x.com' }, req })).resolves.toEqual({
      status: 200,
      body: { userId: 'u1', id: 7 }
    });
    expect(SuperAdmin.create).toHaveBeenCalledWith('u1');
  });

  it('returns 401 when there is no session', async () => {
    getSession.mockResolvedValue(null);

    await expect(route.addSuperAdmin({ body: { email: 'a@x.com' }, req })).resolves.toEqual(unauthorized);
  });

  it('returns 401 when the caller is not a super admin and creates nothing', async () => {
    loginAsRegularUser();

    await expect(route.addSuperAdmin({ body: { email: 'a@x.com' }, req })).resolves.toEqual(unauthorized);
    expect(SuperAdmin.create).not.toHaveBeenCalled();
  });

  it('returns 500 when no user has that email', async () => {
    loginAsSuperAdmin();
    (User.getByEmail as jest.Mock).mockResolvedValue(undefined);

    await expect(route.addSuperAdmin({ body: { email: 'ghost@x.com' }, req })).resolves.toEqual({
      status: 500,
      body: { message: 'User does not exist' }
    });
    expect(SuperAdmin.create).not.toHaveBeenCalled();
  });

  it('returns 500 when the super admin could not be created', async () => {
    loginAsSuperAdmin();
    (User.getByEmail as jest.Mock).mockResolvedValue({ id: 'u1' });
    (SuperAdmin.create as jest.Mock).mockResolvedValue(undefined);

    await expect(route.addSuperAdmin({ body: { email: 'a@x.com' }, req })).resolves.toEqual({
      status: 500,
      body: { message: 'Failed to create admin' }
    });
  });

  it('returns 500 when something throws, e.g. a duplicate', async () => {
    loginAsSuperAdmin();
    (User.getByEmail as jest.Mock).mockResolvedValue({ id: 'u1' });
    (SuperAdmin.create as jest.Mock).mockRejectedValue(new Error('duplicate key'));

    await expect(route.addSuperAdmin({ body: { email: 'a@x.com' }, req })).resolves.toEqual({
      status: 500,
      body: { message: 'Error: duplicate key' }
    });
  });
});

describe('superAdminRoute.getAllWithEmail', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns every super admin with their email', async () => {
    loginAsSuperAdmin();
    (SuperAdminWithEmail.getAll as jest.Mock).mockResolvedValue([
      { values: { id: 1, user_id: 'u1' }, email: 'a@x.com' }
    ]);

    await expect(route.getAllWithEmail({ req })).resolves.toEqual({
      status: 200,
      body: { admins: [{ id: 1, user_id: 'u1', email: 'a@x.com' }] }
    });
  });

  it('returns an empty list when there are no super admins', async () => {
    loginAsSuperAdmin();
    (SuperAdminWithEmail.getAll as jest.Mock).mockResolvedValue([]);

    await expect(route.getAllWithEmail({ req })).resolves.toEqual({
      status: 200,
      body: { admins: [] }
    });
  });

  it('returns 401 when there is no session', async () => {
    getSession.mockResolvedValue(null);

    await expect(route.getAllWithEmail({ req })).resolves.toEqual(unauthorized);
  });

  it('returns 401 when the caller is not a super admin and fetches nothing', async () => {
    loginAsRegularUser();

    await expect(route.getAllWithEmail({ req })).resolves.toEqual(unauthorized);
    expect(SuperAdminWithEmail.getAll).not.toHaveBeenCalled();
  });

  it('returns 500 when something throws', async () => {
    loginAsSuperAdmin();
    (SuperAdminWithEmail.getAll as jest.Mock).mockRejectedValue(new Error('db down'));

    await expect(route.getAllWithEmail({ req })).resolves.toEqual({
      status: 500,
      body: { message: 'Error: db down' }
    });
  });
});

describe('superAdminRoute.revokeSuperAdmin', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('removes the super admin and returns 200', async () => {
    loginAsSuperAdmin();

    await expect(route.revokeSuperAdmin({ body: { userId: 'u1' }, req })).resolves.toEqual({
      status: 200
    });
    expect(SuperAdmin.revoke).toHaveBeenCalledWith('u1');
  });

  it('returns 401 when there is no session', async () => {
    getSession.mockResolvedValue(null);

    await expect(route.revokeSuperAdmin({ body: { userId: 'u1' }, req })).resolves.toEqual(unauthorized);
  });

  it('returns 401 when the caller is not a super admin and revokes nothing', async () => {
    loginAsRegularUser();

    await expect(route.revokeSuperAdmin({ body: { userId: 'u1' }, req })).resolves.toEqual(unauthorized);
    expect(SuperAdmin.revoke).not.toHaveBeenCalled();
  });

  it('returns 500 when something throws', async () => {
    loginAsSuperAdmin();
    (SuperAdmin.revoke as jest.Mock).mockRejectedValue(new Error('db down'));

    await expect(route.revokeSuperAdmin({ body: { userId: 'u1' }, req })).resolves.toEqual({
      status: 500,
      body: { message: 'Error: db down' }
    });
  });
});

describe('superAdminRoute.demote', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('swaps the super admin row for an admin row and returns 200', async () => {
    loginAsSuperAdmin();
    (SuperAdmin.getByUserId as jest.Mock).mockResolvedValue({ id: 3, user_id: 'u1' });

    await expect(route.demote({ body: { userId: 'u1' }, req })).resolves.toEqual({ status: 200 });
    expect(SuperAdmin.revoke).toHaveBeenCalledWith('u1');
    expect(Admin.create).toHaveBeenCalledWith('u1');
  });

  it('returns 401 when there is no session', async () => {
    getSession.mockResolvedValue(null);

    await expect(route.demote({ body: { userId: 'u1' }, req })).resolves.toEqual(unauthorized);
  });

  it('returns 401 when the caller is not a super admin and changes nothing', async () => {
    loginAsRegularUser();

    await expect(route.demote({ body: { userId: 'u1' }, req })).resolves.toEqual(unauthorized);
    expect(SuperAdmin.revoke).not.toHaveBeenCalled();
    expect(Admin.create).not.toHaveBeenCalled();
  });

  it('returns 500 and changes nothing when the user is not a super admin', async () => {
    loginAsSuperAdmin();
    (SuperAdmin.getByUserId as jest.Mock).mockResolvedValue(undefined);

    await expect(route.demote({ body: { userId: 'u1' }, req })).resolves.toEqual({
      status: 500,
      body: { message: 'Failed to demote, user is not a super admin' }
    });
    expect(SuperAdmin.revoke).not.toHaveBeenCalled();
    expect(Admin.create).not.toHaveBeenCalled();
  });

  it('returns 500 when something throws', async () => {
    loginAsSuperAdmin();
    (SuperAdmin.getByUserId as jest.Mock).mockResolvedValue({ id: 3, user_id: 'u1' });
    (SuperAdmin.revoke as jest.Mock).mockRejectedValue(new Error('db down'));

    await expect(route.demote({ body: { userId: 'u1' }, req })).resolves.toEqual({
      status: 500,
      body: { message: 'Error: db down' }
    });
    expect(Admin.create).not.toHaveBeenCalled();
  });
});
