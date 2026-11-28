/**
 * @jest-environment node
 */
import { superAdminRoute } from './super-admin';
import { auth } from '../auth';
import { SuperAdmin, SuperAdminWithEmail } from '../model/SuperAdmin';
import { Admin } from '../model/Admin';
import { User } from '../model/User';

jest.mock('@ts-rest/next', () => ({ createNextRoute: (_router: unknown, handlers: unknown) => handlers }));
jest.mock('../auth', () => ({ auth: { api: { getSession: jest.fn() } } }));
jest.mock('../model/SuperAdmin', () => ({
  SuperAdmin: { isSuperAdmin: jest.fn(), create: jest.fn(), revoke: jest.fn(), getByUserId: jest.fn() },
  SuperAdminWithEmail: { getAll: jest.fn() }
}));
jest.mock('../model/Admin', () => ({ Admin: { isAdmin: jest.fn(), create: jest.fn() } }));
jest.mock('../model/User', () => ({ User: { getByEmail: jest.fn(), getById: jest.fn() } }));

const mockedGetSession = (auth as unknown as { api: { getSession: jest.Mock } }).api.getSession;
const mockedSuperAdmin = SuperAdmin as unknown as {
  isSuperAdmin: jest.Mock;
  create: jest.Mock;
  revoke: jest.Mock;
  getByUserId: jest.Mock;
};
const mockedSuperAdminWithEmail = SuperAdminWithEmail as unknown as { getAll: jest.Mock };
const mockedAdmin = Admin as unknown as { isAdmin: jest.Mock; create: jest.Mock };
const mockedUser = User as unknown as { getByEmail: jest.Mock; getById: jest.Mock };

const session = { user: { id: 'sa1', email: 'sa@b.com' } };
const req = { headers: {} } as unknown as Request;

type RouteResult = { status: number; body?: unknown };
const routes = superAdminRoute as unknown as {
  isSuperAdmin: (input: { body: unknown; req: Request }) => Promise<RouteResult>;
  isValidSuperAdminEmail: (input: { body: unknown; req: Request }) => Promise<RouteResult>;
  isValidAdminEmail: (input: { body: unknown; req: Request }) => Promise<RouteResult>;
  addSuperAdmin: (input: { body: unknown; req: Request }) => Promise<RouteResult>;
  getAllWithEmail: (input: { req: Request }) => Promise<RouteResult>;
  revokeSuperAdmin: (input: { body: unknown; req: Request }) => Promise<RouteResult>;
  demote: (input: { body: unknown; req: Request }) => Promise<RouteResult>;
};

beforeEach(() => {
  jest.resetAllMocks();
  mockedGetSession.mockResolvedValue(session);
  // Default: the session user is a super admin, so role checks pass.
  mockedSuperAdmin.isSuperAdmin.mockResolvedValue(true);
});

describe('isSuperAdmin', () => {
  it('returns 401 when there is no session', async () => {
    mockedGetSession.mockResolvedValue(null);

    const result = await routes.isSuperAdmin({ body: { id: 'u1' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
  });

  it('returns 401 when the queried user does not exist', async () => {
    mockedUser.getById.mockResolvedValue(undefined);

    const result = await routes.isSuperAdmin({ body: { id: 'missing' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
  });

  it('lets a non-super-admin check their own status and reports isAdmin: false', async () => {
    mockedUser.getById.mockResolvedValue({ values: { id: 'sa1', email: 'sa@b.com' } });
    mockedSuperAdmin.isSuperAdmin.mockResolvedValue(false);

    const result = await routes.isSuperAdmin({ body: { id: 'sa1' }, req });

    expect(result).toEqual({ status: 200, body: { isAdmin: false } });
  });

  it('returns 401 when a non-super-admin checks someone else', async () => {
    mockedUser.getById.mockResolvedValue({ values: { id: 'u2', email: 'other@b.com' } });
    mockedSuperAdmin.isSuperAdmin.mockResolvedValue(false);

    const result = await routes.isSuperAdmin({ body: { id: 'u2' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
  });

  it('reports the target user super admin status for a super admin', async () => {
    mockedUser.getById.mockResolvedValue({ values: { id: 'u2', email: 'u2@b.com' } });
    // First call: session check (true). Second call: the target user.
    mockedSuperAdmin.isSuperAdmin
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const result = await routes.isSuperAdmin({ body: { id: 'u2' }, req });

    expect(mockedSuperAdmin.isSuperAdmin).toHaveBeenNthCalledWith(2, 'u2');
    expect(result).toEqual({ status: 200, body: { isAdmin: false } });
  });
});

describe('isValidSuperAdminEmail', () => {
  it('returns 401 when the session is not a super admin', async () => {
    mockedSuperAdmin.isSuperAdmin.mockResolvedValue(false);

    const result = await routes.isValidSuperAdminEmail({ body: { email: 'a@b.com' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
  });

  it('reports no_user_exists when the email is not a user', async () => {
    mockedUser.getByEmail.mockResolvedValue(undefined);

    const result = await routes.isValidSuperAdminEmail({ body: { email: 'missing@b.com' }, req });

    expect(result).toEqual({ status: 200, body: { status: 'no_user_exists' } });
  });

  it('reports super_admin_exists when the user is already a super admin', async () => {
    mockedUser.getByEmail.mockResolvedValue({ values: { id: 'u2', email: 'u2@b.com' } });
    // First call: session check. Second call: the queried user.
    mockedSuperAdmin.isSuperAdmin
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);

    const result = await routes.isValidSuperAdminEmail({ body: { email: 'u2@b.com' }, req });

    expect(mockedSuperAdmin.isSuperAdmin).toHaveBeenNthCalledWith(2, 'u2');
    expect(result).toEqual({ status: 200, body: { status: 'super_admin_exists' } });
  });

  it('reports success for a user that is not a super admin', async () => {
    mockedUser.getByEmail.mockResolvedValue({ values: { id: 'u2', email: 'u2@b.com' } });
    mockedSuperAdmin.isSuperAdmin
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const result = await routes.isValidSuperAdminEmail({ body: { email: 'u2@b.com' }, req });

    expect(result).toEqual({ status: 200, body: { status: 'success' } });
  });
});

describe('isValidAdminEmail', () => {
  it('returns 401 when the session is not a super admin', async () => {
    mockedSuperAdmin.isSuperAdmin.mockResolvedValue(false);

    const result = await routes.isValidAdminEmail({ body: { email: 'a@b.com' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
  });

  it('reports no_user_exists when the email is not a user', async () => {
    mockedUser.getByEmail.mockResolvedValue(undefined);

    const result = await routes.isValidAdminEmail({ body: { email: 'missing@b.com' }, req });

    expect(result).toEqual({ status: 200, body: { status: 'no_user_exists' } });
  });

  it('reports admin_exists when the user is already an admin', async () => {
    mockedUser.getByEmail.mockResolvedValue({ values: { id: 'u2', email: 'u2@b.com' } });
    mockedAdmin.isAdmin.mockResolvedValue(true);

    const result = await routes.isValidAdminEmail({ body: { email: 'u2@b.com' }, req });

    expect(mockedAdmin.isAdmin).toHaveBeenCalledWith('u2');
    expect(result).toEqual({ status: 200, body: { status: 'admin_exists' } });
  });

  it('reports success for a plain user', async () => {
    mockedUser.getByEmail.mockResolvedValue({ values: { id: 'u2', email: 'u2@b.com' } });
    mockedAdmin.isAdmin.mockResolvedValue(false);

    const result = await routes.isValidAdminEmail({ body: { email: 'u2@b.com' }, req });

    expect(result).toEqual({ status: 200, body: { status: 'success' } });
  });
});

describe('addSuperAdmin', () => {
  it('returns 401 when the session is not a super admin', async () => {
    mockedSuperAdmin.isSuperAdmin.mockResolvedValue(false);

    const result = await routes.addSuperAdmin({ body: { email: 'a@b.com' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedSuperAdmin.create).not.toHaveBeenCalled();
  });

  it('returns 500 when the user does not exist', async () => {
    mockedUser.getByEmail.mockResolvedValue(undefined);

    const result = await routes.addSuperAdmin({ body: { email: 'missing@b.com' }, req });

    expect(result).toEqual({ status: 500, body: { message: 'User does not exist' } });
    expect(mockedSuperAdmin.create).not.toHaveBeenCalled();
  });

  it('creates the super admin from the looked-up user id and returns the new row', async () => {
    mockedUser.getByEmail.mockResolvedValue({ values: { id: 'u2', email: 'u2@b.com' } });
    mockedSuperAdmin.create.mockResolvedValue({ values: { id: 9, userId: 'u2' } });

    const result = await routes.addSuperAdmin({ body: { email: 'u2@b.com' }, req });

    expect(mockedSuperAdmin.create).toHaveBeenCalledWith('u2');
    expect(result).toEqual({ status: 200, body: { userId: 'u2', id: 9 } });
  });

  it('returns 500 when the super admin row is not created', async () => {
    mockedUser.getByEmail.mockResolvedValue({ values: { id: 'u2', email: 'u2@b.com' } });
    mockedSuperAdmin.create.mockResolvedValue(undefined);

    const result = await routes.addSuperAdmin({ body: { email: 'u2@b.com' }, req });

    expect(result).toEqual({ status: 500, body: { message: 'Failed to create admin' } });
  });
});

describe('getAllWithEmail', () => {
  it('returns 401 when the session is not a super admin', async () => {
    mockedSuperAdmin.isSuperAdmin.mockResolvedValue(false);

    const result = await routes.getAllWithEmail({ req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedSuperAdminWithEmail.getAll).not.toHaveBeenCalled();
  });

  it('returns each super admin with its email', async () => {
    mockedSuperAdminWithEmail.getAll.mockResolvedValue([
      { values: { id: 1, userId: 'u1' }, email: 'sa@b.com' }
    ]);

    const result = await routes.getAllWithEmail({ req });

    expect(result).toEqual({
      status: 200,
      body: { admins: [{ id: 1, userId: 'u1', email: 'sa@b.com' }] }
    });
  });
});

describe('revokeSuperAdmin', () => {
  it('returns 401 when the session is not a super admin', async () => {
    mockedSuperAdmin.isSuperAdmin.mockResolvedValue(false);

    const result = await routes.revokeSuperAdmin({ body: { userId: 'u1' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedSuperAdmin.revoke).not.toHaveBeenCalled();
  });

  it('revokes the super admin by user id', async () => {
    mockedSuperAdmin.revoke.mockResolvedValue(undefined);

    const result = await routes.revokeSuperAdmin({ body: { userId: 'u1' }, req });

    expect(mockedSuperAdmin.revoke).toHaveBeenCalledWith('u1');
    expect(result).toEqual({ status: 200 });
  });
});

describe('demote', () => {
  it('returns 401 when the session is not a super admin', async () => {
    mockedSuperAdmin.isSuperAdmin.mockResolvedValue(false);

    const result = await routes.demote({ body: { userId: 'u1' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
  });

  it('returns 500 when the user is not a super admin', async () => {
    mockedSuperAdmin.getByUserId.mockResolvedValue(undefined);

    const result = await routes.demote({ body: { userId: 'u1' }, req });

    expect(result).toEqual({ status: 500, body: { message: 'Failed to demote, user is not a super admin' } });
    expect(mockedSuperAdmin.revoke).not.toHaveBeenCalled();
    expect(mockedAdmin.create).not.toHaveBeenCalled();
  });

  it('revokes the super admin row and creates the admin row for the same user', async () => {
    mockedSuperAdmin.getByUserId.mockResolvedValue({ id: 9, userId: 'u2' });
    mockedSuperAdmin.revoke.mockResolvedValue(undefined);
    mockedAdmin.create.mockResolvedValue({ values: { id: 1, userId: 'u2' } });

    const result = await routes.demote({ body: { userId: 'u2' }, req });

    expect(mockedSuperAdmin.revoke).toHaveBeenCalledWith('u2');
    expect(mockedAdmin.create).toHaveBeenCalledWith('u2');
    expect(result).toEqual({ status: 200 });
  });
});
