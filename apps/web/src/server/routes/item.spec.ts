/**
 * @jest-environment node
 */
import { nextItemRoute } from './item';
import { auth } from '../auth';
import { Item } from '../model/Item';
import { SuperAdmin } from '../model/SuperAdmin';
import { HttpError } from '../errors';

jest.mock('@ts-rest/next', () => ({ createNextRoute: (_router: unknown, handlers: unknown) => handlers }));
jest.mock('../auth', () => ({ auth: { api: { getSession: jest.fn() } } }));
jest.mock('../model/Item', () => ({
  Item: { create: jest.fn(), getByIdAndOrgPath: jest.fn(), getAllGroupByOrgs: jest.fn() }
}));
jest.mock('../model/SuperAdmin', () => ({
  SuperAdmin: { isSuperAdmin: jest.fn() }
}));

const mockedGetSession = (auth as unknown as { api: { getSession: jest.Mock } }).api.getSession;
const mockedItem = Item as unknown as {
  create: jest.Mock;
  getByIdAndOrgPath: jest.Mock;
  getAllGroupByOrgs: jest.Mock;
};
const mockedIsSuperAdmin = (SuperAdmin as unknown as { isSuperAdmin: jest.Mock }).isSuperAdmin;

const session = { user: { id: 'u1', email: 'a@b.com' } };
const req = { headers: {} } as unknown as Request;
const itemValues = { id: 7, name: 'HDMI cable', description: null, status: 'available' as const };

type RouteResult = { status: number; body?: unknown };
const routes = nextItemRoute as unknown as {
  createItem: (input: { body: unknown; req: Request }) => Promise<RouteResult>;
  getByIdAndOrgPath: (input: { params: unknown; req: Request }) => Promise<RouteResult>;
  getAll: (input: { req: Request }) => Promise<RouteResult>;
};

beforeEach(() => {
  jest.resetAllMocks();
  mockedGetSession.mockResolvedValue(session);
});

describe('createItem', () => {
  it('returns 401 when there is no session', async () => {
    mockedGetSession.mockResolvedValue(null);

    const result = await routes.createItem({ body: { orgId: 5 }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedItem.create).not.toHaveBeenCalled();
  });

  it('splits the orgId out of the body and returns the created id and status', async () => {
    mockedItem.create.mockResolvedValue({ values: itemValues });

    const result = await routes.createItem({
      body: { orgId: 5, name: 'HDMI cable', description: null },
      req
    });

    expect(mockedItem.create).toHaveBeenCalledWith({ name: 'HDMI cable', description: null }, 5);
    expect(result).toEqual({ status: 200, body: { id: 7, status: 'available' } });
  });

  it('maps a thrown error to a 500 with the error stringified', async () => {
    mockedItem.create.mockRejectedValue(new Error('boom'));

    const result = await routes.createItem({ body: { orgId: 5, name: 'x', description: null }, req });

    expect(result).toEqual({ status: 500, body: { message: 'Error: boom' } });
  });
});

describe('getByIdAndOrgPath', () => {
  it('returns 401 when there is no session', async () => {
    mockedGetSession.mockResolvedValue(null);

    const result = await routes.getByIdAndOrgPath({ params: { id: 1, orgPath: 'org1' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedItem.getByIdAndOrgPath).not.toHaveBeenCalled();
  });

  it('returns the item values for the params', async () => {
    mockedItem.getByIdAndOrgPath.mockResolvedValue({ values: itemValues });

    const result = await routes.getByIdAndOrgPath({ params: { id: 1, orgPath: 'org1' }, req });

    expect(mockedItem.getByIdAndOrgPath).toHaveBeenCalledWith(1, 'org1');
    expect(result).toEqual({ status: 200, body: itemValues });
  });

  it('maps an HttpError to its status', async () => {
    mockedItem.getByIdAndOrgPath.mockRejectedValue(new HttpError(404, 'Item not found'));

    const result = await routes.getByIdAndOrgPath({ params: { id: 1, orgPath: 'org1' }, req });

    expect(result).toEqual({ status: 404, body: { message: 'Item not found' } });
  });

  it('maps a plain Error to a 500', async () => {
    mockedItem.getByIdAndOrgPath.mockRejectedValue(new Error('db down'));

    const result = await routes.getByIdAndOrgPath({ params: { id: 1, orgPath: 'org1' }, req });

    expect(result).toEqual({ status: 500, body: { message: 'db down' } });
  });
});

describe('getAll', () => {
  it('returns 401 when there is no session', async () => {
    mockedGetSession.mockResolvedValue(null);

    const result = await routes.getAll({ req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedItem.getAllGroupByOrgs).not.toHaveBeenCalled();
  });

  it('returns 401 for a session that is not a super admin', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);

    const result = await routes.getAll({ req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedItem.getAllGroupByOrgs).not.toHaveBeenCalled();
  });

  it('returns the items grouped by org for a super admin', async () => {
    mockedIsSuperAdmin.mockResolvedValue(true);
    const grouped = [{ orgId: 1, items: [itemValues] }];
    mockedItem.getAllGroupByOrgs.mockResolvedValue(grouped);

    const result = await routes.getAll({ req });

    expect(mockedIsSuperAdmin).toHaveBeenCalledWith('u1');
    expect(result).toEqual({ status: 200, body: grouped });
  });
});
