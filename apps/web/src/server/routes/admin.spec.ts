/**
 * @jest-environment node
 */
import { adminRoute } from './admin';
import { auth } from '../auth';
import { User } from '../model/User';
import { Admin, AdminWithEmail } from '../model/Admin';
import { SuperAdmin } from '../model/SuperAdmin';

jest.mock('../auth', () => ({ auth: { api: { getSession: jest.fn() } } }));
jest.mock('../model/User', () => ({ User: { getById: jest.fn(), getByEmail: jest.fn() } }));
jest.mock('../model/Admin', () => ({
  Admin: { isAdmin: jest.fn(), create: jest.fn(), revoke: jest.fn(), getByUserId: jest.fn() },
  AdminWithEmail: { getAll: jest.fn() }
}));
jest.mock('../model/SuperAdmin', () => ({
  SuperAdmin: { isSuperAdmin: jest.fn(), create: jest.fn() }
}));

const getSession = auth.api.getSession as unknown as jest.Mock;

const req = { headers: {} };
const route = adminRoute as any;
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

describe('adminRoute.isAdmin', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('lets a super admin ask about anyone and returns their admin status', async () => {
    loginAsSuperAdmin();
    (User.getById as jest.Mock).mockResolvedValue({ id: 'other', email: 'other@x.com' });
    (Admin.isAdmin as jest.Mock).mockResolvedValue(true);

    await expect(route.isAdmin({ body: { id: 'other' }, req })).resolves.toEqual({
      status: 200,
      body: { isAdmin: true }
    });
  });

  it('lets a regular user ask about themselves (same email)', async () => {
    loginAsRegularUser();
    (User.getById as jest.Mock).mockResolvedValue({ id: 'caller', email: 'caller@x.com' });
    (Admin.isAdmin as jest.Mock).mockResolvedValue(false);

    await expect(route.isAdmin({ body: { id: 'caller' }, req })).resolves.toEqual({
      status: 200,
      body: { isAdmin: false }
    });
  });

  it('returns 401 when there is no session', async () => {
    getSession.mockResolvedValue(null);

    await expect(route.isAdmin({ body: { id: 'u1' }, req })).resolves.toEqual(unauthorized);
  });

  it('returns 401 when the queried user does not exist', async () => {
    loginAsSuperAdmin();
    (User.getById as jest.Mock).mockResolvedValue(undefined);

    await expect(route.isAdmin({ body: { id: 'ghost' }, req })).resolves.toEqual(unauthorized);
  });

  it('returns 401 when a regular user asks about someone else (different email)', async () => {
    loginAsRegularUser();
    (User.getById as jest.Mock).mockResolvedValue({ id: 'other', email: 'other@x.com' });

    await expect(route.isAdmin({ body: { id: 'other' }, req })).resolves.toEqual(unauthorized);
  });
});

describe('adminRoute.addAdmin', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('creates an admin for the email and returns its ids', async () => {
    loginAsSuperAdmin();
    (User.getByEmail as jest.Mock).mockResolvedValue({ id: 'u1' });
    (Admin.create as jest.Mock).mockResolvedValue({ values: { id: 7, user_id: 'u1' } });

    await expect(route.addAdmin({ body: { email: 'a@x.com' }, req })).resolves.toEqual({
      status: 200,
      body: { userId: 'u1', id: 7 }
    });
  });

  it('returns 401 when there is no session', async () => {
    getSession.mockResolvedValue(null);

    await expect(route.addAdmin({ body: { email: 'a@x.com' }, req })).resolves.toEqual(
      unauthorized
    );
  });

  it('returns 401 when the caller is not a super admin and creates nothing', async () => {
    loginAsRegularUser();

    await expect(route.addAdmin({ body: { email: 'a@x.com' }, req })).resolves.toEqual(
      unauthorized
    );
    expect(Admin.create).not.toHaveBeenCalled();
  });

  it('returns 500 when no user has that email', async () => {
    loginAsSuperAdmin();
    (User.getByEmail as jest.Mock).mockResolvedValue(undefined);

    await expect(route.addAdmin({ body: { email: 'ghost@x.com' }, req })).resolves.toEqual({
      status: 500,
      body: { message: 'User does not exist' }
    });
    expect(Admin.create).not.toHaveBeenCalled();
  });

  it('returns 500 when the admin could not be created', async () => {
    loginAsSuperAdmin();
    (User.getByEmail as jest.Mock).mockResolvedValue({ id: 'u1' });
    (Admin.create as jest.Mock).mockResolvedValue(undefined);

    await expect(route.addAdmin({ body: { email: 'a@x.com' }, req })).resolves.toEqual({
      status: 500,
      body: { message: 'Failed to create admin' }
    });
  });
});

describe('adminRoute.getAllWithEmail', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns every admin with their email', async () => {
    loginAsSuperAdmin();
    (AdminWithEmail.getAll as jest.Mock).mockResolvedValue([
      { values: { id: 1, user_id: 'u1' }, email: 'a@x.com' }
    ]);

    await expect(route.getAllWithEmail({ req })).resolves.toEqual({
      status: 200,
      body: { admins: [{ id: 1, user_id: 'u1', email: 'a@x.com' }] }
    });
  });

  it('returns an empty list when there are no admins', async () => {
    loginAsSuperAdmin();
    (AdminWithEmail.getAll as jest.Mock).mockResolvedValue([]);

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
    expect(AdminWithEmail.getAll).not.toHaveBeenCalled();
  });
});

describe('adminRoute.revokeAdmin', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('removes the admin and returns 200', async () => {
    loginAsSuperAdmin();

    await expect(route.revokeAdmin({ body: { userId: 'u1' }, req })).resolves.toEqual({
      status: 200
    });
    expect(Admin.revoke).toHaveBeenCalledWith('u1');
  });

  it('returns 401 when there is no session', async () => {
    getSession.mockResolvedValue(null);

    await expect(route.revokeAdmin({ body: { userId: 'u1' }, req })).resolves.toEqual(unauthorized);
  });

  it('returns 401 when the caller is not a super admin and revokes nothing', async () => {
    loginAsRegularUser();

    await expect(route.revokeAdmin({ body: { userId: 'u1' }, req })).resolves.toEqual(unauthorized);
    expect(Admin.revoke).not.toHaveBeenCalled();
  });
});

describe('adminRoute.promote', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('swaps the admin row for a super admin row and returns 200', async () => {
    loginAsSuperAdmin();
    (Admin.getByUserId as jest.Mock).mockResolvedValue({ id: 3, user_id: 'u1' });

    await expect(route.promote({ body: { userId: 'u1' }, req })).resolves.toEqual({ status: 200 });
    expect(Admin.revoke).toHaveBeenCalledWith('u1');
    expect(SuperAdmin.create).toHaveBeenCalledWith('u1');
  });

  it('returns 401 when there is no session', async () => {
    getSession.mockResolvedValue(null);

    await expect(route.promote({ body: { userId: 'u1' }, req })).resolves.toEqual(unauthorized);
  });

  it('returns 401 when the caller is not a super admin and changes nothing', async () => {
    loginAsRegularUser();

    await expect(route.promote({ body: { userId: 'u1' }, req })).resolves.toEqual(unauthorized);
    expect(Admin.revoke).not.toHaveBeenCalled();
    expect(SuperAdmin.create).not.toHaveBeenCalled();
  });

  it('returns 500 and changes nothing when the user is not an admin', async () => {
    loginAsSuperAdmin();
    (Admin.getByUserId as jest.Mock).mockResolvedValue(undefined);

    await expect(route.promote({ body: { userId: 'u1' }, req })).resolves.toEqual({
      status: 500,
      body: { message: 'Failed to promote, user is not an admin' }
    });
    expect(Admin.revoke).not.toHaveBeenCalled();
    expect(SuperAdmin.create).not.toHaveBeenCalled();
  });
});
