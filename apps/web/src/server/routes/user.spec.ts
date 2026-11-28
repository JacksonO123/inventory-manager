/**
 * @jest-environment node
 */
import { userRoute } from './user';
import { auth } from '../auth';
import { Admin } from '../model/Admin';
import { SuperAdmin } from '../model/SuperAdmin';

jest.mock('@ts-rest/next', () => ({ createNextRoute: (_router: unknown, handlers: unknown) => handlers }));
jest.mock('../auth', () => ({ auth: { api: { getSession: jest.fn() } } }));
jest.mock('../model/Admin', () => ({ Admin: { isAdmin: jest.fn() } }));
jest.mock('../model/SuperAdmin', () => ({
  SuperAdmin: { isSuperAdmin: jest.fn() }
}));

const mockedGetSession = (auth as unknown as { api: { getSession: jest.Mock } }).api.getSession;
const mockedIsAdmin = (Admin as unknown as { isAdmin: jest.Mock }).isAdmin;
const mockedIsSuperAdmin = (SuperAdmin as unknown as { isSuperAdmin: jest.Mock }).isSuperAdmin;

const session = { user: { id: 'u1', email: 'a@b.com' } };
const req = { headers: {} } as unknown as Request;

const routes = userRoute as unknown as {
  getAdminStatus: (input: { req: Request }) => Promise<{ status: number; body?: unknown }>;
};

beforeEach(() => {
  jest.resetAllMocks();
  mockedGetSession.mockResolvedValue(session);
});

describe('getAdminStatus', () => {
  it('returns 401 when there is no session', async () => {
    mockedGetSession.mockResolvedValue(null);

    const result = await routes.getAdminStatus({ req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedIsAdmin).not.toHaveBeenCalled();
    expect(mockedIsSuperAdmin).not.toHaveBeenCalled();
  });

  it.each([
    ['an admin', true, false],
    ['a super admin', false, true],
    ['both', true, true]
  ])('reports admin: true when the user is %s', (_label, isAdmin, isSuperAdmin) => {
    mockedIsAdmin.mockResolvedValue(isAdmin);
    mockedIsSuperAdmin.mockResolvedValue(isSuperAdmin);

    return expect(routes.getAdminStatus({ req })).resolves.toEqual({
      status: 200,
      body: { admin: true, superAdmin: isSuperAdmin }
    });
  });

  it('reports admin: false for a plain user', async () => {
    mockedIsAdmin.mockResolvedValue(false);
    mockedIsSuperAdmin.mockResolvedValue(false);

    const result = await routes.getAdminStatus({ req });

    expect(result).toEqual({ status: 200, body: { admin: false, superAdmin: false } });
  });

  it('checks both roles for the session user', async () => {
    mockedIsAdmin.mockResolvedValue(false);
    mockedIsSuperAdmin.mockResolvedValue(false);

    await routes.getAdminStatus({ req });

    expect(mockedIsAdmin).toHaveBeenCalledWith('u1');
    expect(mockedIsSuperAdmin).toHaveBeenCalledWith('u1');
  });

  it('maps a thrown error via errorResponse', async () => {
    mockedIsAdmin.mockRejectedValue(new Error('db down'));

    const result = await routes.getAdminStatus({ req });

    expect(result).toEqual({ status: 500, body: { message: 'db down' } });
  });
});
