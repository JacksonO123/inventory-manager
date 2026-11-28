/**
 * @jest-environment node
 */
import { adminRoute } from './admin';
import { auth } from '../auth';
import { Admin, AdminWithEmail } from '../model/Admin';
import { SuperAdmin } from '../model/SuperAdmin';
import { User } from '../model/User';

jest.mock('@ts-rest/next', () => ({ createNextRoute: (_router: unknown, handlers: unknown) => handlers }));
jest.mock('../auth', () => ({ auth: { api: { getSession: jest.fn() } } }));
jest.mock('../model/Admin', () => ({
  Admin: { create: jest.fn(), revoke: jest.fn(), getByUserId: jest.fn() },
  AdminWithEmail: { getAll: jest.fn() }
}));
jest.mock('../model/SuperAdmin', () => ({
  SuperAdmin: { isSuperAdmin: jest.fn(), create: jest.fn() }
}));
jest.mock('../model/User', () => ({ User: { getByEmail: jest.fn() } }));

const mockedGetSession = (auth as unknown as { api: { getSession: jest.Mock } }).api.getSession;
const mockedAdmin = Admin as unknown as { create: jest.Mock; revoke: jest.Mock; getByUserId: jest.Mock };
const mockedAdminWithEmail = AdminWithEmail as unknown as { getAll: jest.Mock };
const mockedSuperAdmin = SuperAdmin as unknown as { isSuperAdmin: jest.Mock; create: jest.Mock };
const mockedUser = User as unknown as { getByEmail: jest.Mock };

const session = { user: { id: 'sa1', email: 'sa@b.com' } };
const req = { headers: {} } as unknown as Request;

type RouteResult = { status: number; body?: unknown };
const routes = adminRoute as unknown as {
  addAdmin: (input: { body: unknown; req: Request }) => Promise<RouteResult>;
  getAllWithEmail: (input: { req: Request }) => Promise<RouteResult>;
  revokeAdmin: (input: { body: unknown; req: Request }) => Promise<RouteResult>;
  promote: (input: { body: unknown; req: Request }) => Promise<RouteResult>;
};

beforeEach(() => {
  jest.resetAllMocks();
  mockedGetSession.mockResolvedValue(session);
  mockedSuperAdmin.isSuperAdmin.mockResolvedValue(true);
});

describe('addAdmin', () => {
  it('returns 401 when there is no session', async () => {
    mockedGetSession.mockResolvedValue(null);

    const result = await routes.addAdmin({ body: { email: 'a@b.com' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedAdmin.create).not.toHaveBeenCalled();
  });

  it('returns 401 when the session is not a super admin', async () => {
    mockedSuperAdmin.isSuperAdmin.mockResolvedValue(false);

    const result = await routes.addAdmin({ body: { email: 'a@b.com' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedAdmin.create).not.toHaveBeenCalled();
  });

  it('returns 500 when the user does not exist', async () => {
    mockedUser.getByEmail.mockResolvedValue(undefined);

    const result = await routes.addAdmin({ body: { email: 'missing@b.com' }, req });

    expect(result).toEqual({ status: 500, body: { message: 'User does not exist' } });
    expect(mockedAdmin.create).not.toHaveBeenCalled();
  });

  it('creates the admin from the looked-up user id and returns the new admin', async () => {
    mockedUser.getByEmail.mockResolvedValue({ values: { id: 'u2', email: 'a@b.com' } });
    mockedAdmin.create.mockResolvedValue({ values: { id: 3, userId: 'u2' } });

    const result = await routes.addAdmin({ body: { email: 'a@b.com' }, req });

    expect(mockedUser.getByEmail).toHaveBeenCalledWith('a@b.com');
    expect(mockedAdmin.create).toHaveBeenCalledWith('u2');
    expect(result).toEqual({ status: 200, body: { userId: 'u2', id: 3 } });
  });

  it('returns 500 when the admin row is not created', async () => {
    mockedUser.getByEmail.mockResolvedValue({ values: { id: 'u2', email: 'a@b.com' } });
    mockedAdmin.create.mockResolvedValue(undefined);

    const result = await routes.addAdmin({ body: { email: 'a@b.com' }, req });

    expect(result).toEqual({ status: 500, body: { message: 'Failed to create admin' } });
  });

  it('maps a thrown error to a 500 with the error stringified', async () => {
    mockedUser.getByEmail.mockRejectedValue(new Error('boom'));

    const result = await routes.addAdmin({ body: { email: 'a@b.com' }, req });

    expect(result).toEqual({ status: 500, body: { message: 'Error: boom' } });
  });
});

describe('getAllWithEmail', () => {
  it('returns 401 when the session is not a super admin', async () => {
    mockedSuperAdmin.isSuperAdmin.mockResolvedValue(false);

    const result = await routes.getAllWithEmail({ req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedAdminWithEmail.getAll).not.toHaveBeenCalled();
  });

  it('returns each admin with its email', async () => {
    mockedAdminWithEmail.getAll.mockResolvedValue([
      { values: { id: 1, userId: 'u1' }, email: 'a@b.com' },
      { values: { id: 2, userId: 'u2' }, email: 'c@d.com' }
    ]);

    const result = await routes.getAllWithEmail({ req });

    expect(result).toEqual({
      status: 200,
      body: {
        admins: [
          { id: 1, userId: 'u1', email: 'a@b.com' },
          { id: 2, userId: 'u2', email: 'c@d.com' }
        ]
      }
    });
  });
});

describe('revokeAdmin', () => {
  it('returns 401 when the session is not a super admin', async () => {
    mockedSuperAdmin.isSuperAdmin.mockResolvedValue(false);

    const result = await routes.revokeAdmin({ body: { userId: 'u1' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedAdmin.revoke).not.toHaveBeenCalled();
  });

  it('revokes the admin by user id', async () => {
    mockedAdmin.revoke.mockResolvedValue(undefined);

    const result = await routes.revokeAdmin({ body: { userId: 'u1' }, req });

    expect(mockedAdmin.revoke).toHaveBeenCalledWith('u1');
    expect(result).toEqual({ status: 200 });
  });

  it('maps a thrown error to a 500', async () => {
    mockedAdmin.revoke.mockRejectedValue(new Error('boom'));

    const result = await routes.revokeAdmin({ body: { userId: 'u1' }, req });

    expect(result).toEqual({ status: 500, body: { message: 'Error: boom' } });
  });
});

describe('promote', () => {
  it('returns 401 when the session is not a super admin', async () => {
    mockedSuperAdmin.isSuperAdmin.mockResolvedValue(false);

    const result = await routes.promote({ body: { userId: 'u1' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
  });

  it('returns 500 when the user is not an admin', async () => {
    mockedAdmin.getByUserId.mockResolvedValue(undefined);

    const result = await routes.promote({ body: { userId: 'u1' }, req });

    expect(result).toEqual({ status: 500, body: { message: 'Failed to promote, user is not an admin' } });
    expect(mockedAdmin.revoke).not.toHaveBeenCalled();
    expect(mockedSuperAdmin.create).not.toHaveBeenCalled();
  });

  it('revokes the admin row and creates the super admin row for the same user', async () => {
    mockedAdmin.getByUserId.mockResolvedValue({ values: { id: 1, userId: 'u2' } });
    mockedAdmin.revoke.mockResolvedValue(undefined);
    mockedSuperAdmin.create.mockResolvedValue({ values: { id: 9, userId: 'u2' } });

    const result = await routes.promote({ body: { userId: 'u2' }, req });

    expect(mockedAdmin.revoke).toHaveBeenCalledWith('u2');
    expect(mockedSuperAdmin.create).toHaveBeenCalledWith('u2');
    expect(result).toEqual({ status: 200 });
  });
});
