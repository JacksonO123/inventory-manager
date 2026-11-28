/**
 * @jest-environment node
 */
import { reservationRoute } from './reservation';
import { auth } from '../auth';
import { Reservation } from '../model/Reservation';
import { SuperAdmin } from '../model/SuperAdmin';
import { User } from '../model/User';
import { Admin } from '../model/Admin';
import { HttpError } from '../errors';

jest.mock('@ts-rest/next', () => ({ createNextRoute: (_router: unknown, handlers: unknown) => handlers }));
jest.mock('../auth', () => ({ auth: { api: { getSession: jest.fn() } } }));
jest.mock('../model/Reservation', () => ({
  Reservation: {
    create: jest.fn(),
    accept: jest.fn(),
    reject: jest.fn(),
    getByItemIdAndOrgIdBetweenDates: jest.fn(),
    getByOrgIdBetweenDates: jest.fn(),
    getAllByOrgPath: jest.fn()
  }
}));
jest.mock('../model/SuperAdmin', () => ({ SuperAdmin: { isSuperAdmin: jest.fn() } }));
jest.mock('../model/User', () => ({ User: { isMemberOfOrgById: jest.fn() } }));
jest.mock('../model/Admin', () => ({ Admin: { isAdmin: jest.fn() } }));

const mockedGetSession = (auth as unknown as { api: { getSession: jest.Mock } }).api.getSession;
const mockedReservation = Reservation as unknown as {
  create: jest.Mock;
  accept: jest.Mock;
  reject: jest.Mock;
  getByItemIdAndOrgIdBetweenDates: jest.Mock;
  getByOrgIdBetweenDates: jest.Mock;
  getAllByOrgPath: jest.Mock;
};
const mockedIsSuperAdmin = (SuperAdmin as unknown as { isSuperAdmin: jest.Mock }).isSuperAdmin;
const mockedIsMemberOfOrgById = (User as unknown as { isMemberOfOrgById: jest.Mock }).isMemberOfOrgById;
const mockedIsAdmin = (Admin as unknown as { isAdmin: jest.Mock }).isAdmin;

const session = { user: { id: 'u1', email: 'a@b.com' } };
const req = { headers: {} } as unknown as Request;
const start = new Date('2026-01-01T00:00:00Z');
const end = new Date('2026-01-01T02:00:00Z'); // 2h, within the free limit

type RouteResult = { status: number; body?: unknown };
const routes = reservationRoute as unknown as {
  addReservation: (input: { body: unknown; req: Request }) => Promise<RouteResult>;
  getByItemIdAndOrgPathBetweenDates: (input: {
    body: unknown;
    params: unknown;
    req: Request;
  }) => Promise<RouteResult>;
  getWithOrgIdBetweenDates: (input: {
    body: unknown;
    params: unknown;
    req: Request;
  }) => Promise<RouteResult>;
  accept: (input: { body: unknown; req: Request }) => Promise<RouteResult>;
  reject: (input: { body: unknown; req: Request }) => Promise<RouteResult>;
  getWithOrgPath: (input: { params: unknown; req: Request }) => Promise<RouteResult>;
};

beforeEach(() => {
  jest.resetAllMocks();
  mockedGetSession.mockResolvedValue(session);
});

describe('addReservation', () => {
  const event = { start, end, allDay: false, itemId: 1, orgId: 5, status: 'accepted' };

  it('returns 401 when there is no session', async () => {
    mockedGetSession.mockResolvedValue(null);

    const result = await routes.addReservation({ body: { event, borrowerId: 'u1' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedReservation.create).not.toHaveBeenCalled();
  });

  it('rejects when the end date is not after the start date', async () => {
    const result = await routes.addReservation({
      body: { event: { ...event, end: start }, borrowerId: 'u1' },
      req
    });

    expect(result).toEqual({ status: 500, body: { message: 'End date is less than or equal to start date' } });
    expect(mockedReservation.create).not.toHaveBeenCalled();
  });

  it('rejects a too-long event that is not a pending request', async () => {
    const longEnd = new Date('2026-01-01T05:00:00Z'); // 5h > 4h free limit

    const result = await routes.addReservation({
      body: { event: { ...event, end: longEnd }, borrowerId: 'u1' },
      req
    });

    expect(result).toEqual({ status: 500, body: { message: 'Event too long, send a request instead' } });
    expect(mockedReservation.create).not.toHaveBeenCalled();
  });

  it('allows a too-long event when it is a pending request', async () => {
    const longEnd = new Date('2026-01-01T05:00:00Z');
    mockedReservation.create.mockResolvedValue({ values: { id: '5' } });

    const result = await routes.addReservation({
      body: { event: { ...event, end: longEnd, status: 'pending' }, borrowerId: 'u1' },
      req
    });

    expect(mockedReservation.create).toHaveBeenCalledWith(
      { ...event, end: longEnd, status: 'pending' },
      'u1',
      'pending'
    );
    expect(result).toEqual({ status: 200, body: { id: '5' } });
  });

  it('creates the reservation and returns its id', async () => {
    mockedReservation.create.mockResolvedValue({ values: { id: '5' } });

    const result = await routes.addReservation({ body: { event, borrowerId: 'u1' }, req });

    expect(mockedReservation.create).toHaveBeenCalledWith(event, 'u1', 'accepted');
    expect(result).toEqual({ status: 200, body: { id: '5' } });
  });

  it('returns 409 when the reservation overlaps an existing one', async () => {
    mockedReservation.create.mockResolvedValue(null);

    const result = await routes.addReservation({ body: { event, borrowerId: 'u1' }, req });

    expect(result).toEqual({ status: 409, body: { message: 'Reservation overlaps' } });
  });

  it('maps a thrown error via errorResponse', async () => {
    mockedReservation.create.mockRejectedValue(new Error('boom'));

    const result = await routes.addReservation({ body: { event, borrowerId: 'u1' }, req });

    // errorResponse uses err.message (not stringification) for plain Errors.
    expect(result).toEqual({ status: 500, body: { message: 'boom' } });
  });
});

describe('getByItemIdAndOrgPathBetweenDates', () => {
  it('returns 401 when there is no session', async () => {
    mockedGetSession.mockResolvedValue(null);

    const result = await routes.getByItemIdAndOrgPathBetweenDates({
      body: { start, end },
      params: { orgId: 5, itemId: 1 },
      req
    });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
  });

  it('returns 401 when the user is neither a super admin nor a member of the org', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);
    mockedIsMemberOfOrgById.mockResolvedValue(false);

    const result = await routes.getByItemIdAndOrgPathBetweenDates({
      body: { start, end },
      params: { orgId: 5, itemId: 1 },
      req
    });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedReservation.getByItemIdAndOrgIdBetweenDates).not.toHaveBeenCalled();
  });

  it('allows org members and stringifies the reservation ids', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);
    mockedIsMemberOfOrgById.mockResolvedValue(true);
    const row = { id: 42, itemId: 1, status: 'accepted' };
    mockedReservation.getByItemIdAndOrgIdBetweenDates.mockResolvedValue([row]);

    const result = await routes.getByItemIdAndOrgPathBetweenDates({
      body: { start, end },
      params: { orgId: 5, itemId: 1 },
      req
    });

    expect(mockedIsMemberOfOrgById).toHaveBeenCalledWith('u1', 5);
    expect(mockedReservation.getByItemIdAndOrgIdBetweenDates).toHaveBeenCalledWith(5, 1, start, end);
    expect(result).toEqual({ status: 200, body: [{ ...row, id: '42' }] });
  });

  it('allows super admins even when they are not members', async () => {
    mockedIsSuperAdmin.mockResolvedValue(true);
    mockedIsMemberOfOrgById.mockResolvedValue(false);
    mockedReservation.getByItemIdAndOrgIdBetweenDates.mockResolvedValue([]);

    const result = await routes.getByItemIdAndOrgPathBetweenDates({
      body: { start, end },
      params: { orgId: 5, itemId: 1 },
      req
    });

    expect(result).toEqual({ status: 200, body: [] });
  });
});

describe('getWithOrgIdBetweenDates', () => {
  it('returns 401 when the user is neither a super admin nor a member of the org', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);
    mockedIsMemberOfOrgById.mockResolvedValue(false);

    const result = await routes.getWithOrgIdBetweenDates({
      body: { start, end },
      params: { orgId: 5 },
      req
    });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedReservation.getByOrgIdBetweenDates).not.toHaveBeenCalled();
  });

  it('returns the org reservations for members with stringified ids', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);
    mockedIsMemberOfOrgById.mockResolvedValue(true);
    const row = { id: 7, itemId: 1, status: 'accepted' };
    mockedReservation.getByOrgIdBetweenDates.mockResolvedValue([row]);

    const result = await routes.getWithOrgIdBetweenDates({
      body: { start, end },
      params: { orgId: 5 },
      req
    });

    expect(mockedReservation.getByOrgIdBetweenDates).toHaveBeenCalledWith(5, start, end);
    expect(result).toEqual({ status: 200, body: [{ ...row, id: '7' }] });
  });
});

describe('accept', () => {
  it('returns 401 when there is no session', async () => {
    mockedGetSession.mockResolvedValue(null);

    const result = await routes.accept({ body: { itemId: 1, reservationId: '5' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedReservation.accept).not.toHaveBeenCalled();
  });

  it('returns 401 when the user is neither an admin nor a super admin', async () => {
    mockedIsAdmin.mockResolvedValue(false);
    mockedIsSuperAdmin.mockResolvedValue(false);

    const result = await routes.accept({ body: { itemId: 1, reservationId: '5' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedReservation.accept).not.toHaveBeenCalled();
  });

  it('accepts the reservation for admins', async () => {
    mockedIsAdmin.mockResolvedValue(true);
    mockedIsSuperAdmin.mockResolvedValue(false);
    mockedReservation.accept.mockResolvedValue(undefined);

    const result = await routes.accept({ body: { itemId: 1, reservationId: '5' }, req });

    expect(mockedReservation.accept).toHaveBeenCalledWith(1, '5');
    expect(result).toEqual({ status: 200, body: {} });
  });

  it('accepts the reservation for super admins who are not admins', async () => {
    mockedIsAdmin.mockResolvedValue(false);
    mockedIsSuperAdmin.mockResolvedValue(true);
    mockedReservation.accept.mockResolvedValue(undefined);

    const result = await routes.accept({ body: { itemId: 1, reservationId: '5' }, req });

    expect(mockedReservation.accept).toHaveBeenCalledWith(1, '5');
    expect(result).toEqual({ status: 200, body: {} });
  });

  it('maps an HttpError via errorResponse', async () => {
    mockedIsAdmin.mockResolvedValue(true);
    mockedIsSuperAdmin.mockResolvedValue(false);
    mockedReservation.accept.mockRejectedValue(new HttpError(404, 'Reservation not found'));

    const result = await routes.accept({ body: { itemId: 1, reservationId: '5' }, req });

    expect(result).toEqual({ status: 404, body: { message: 'Reservation not found' } });
  });
});

describe('reject', () => {
  it('returns 401 when the user is neither an admin nor a super admin', async () => {
    mockedIsAdmin.mockResolvedValue(false);
    mockedIsSuperAdmin.mockResolvedValue(false);

    const result = await routes.reject({ body: { itemId: 1, reservationId: '5' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedReservation.reject).not.toHaveBeenCalled();
  });

  it('rejects the reservation for admins', async () => {
    mockedIsAdmin.mockResolvedValue(true);
    mockedIsSuperAdmin.mockResolvedValue(false);
    mockedReservation.reject.mockResolvedValue(undefined);

    const result = await routes.reject({ body: { itemId: 1, reservationId: '5' }, req });

    expect(mockedReservation.reject).toHaveBeenCalledWith(1, '5');
    expect(result).toEqual({ status: 200, body: {} });
  });

  it('maps an HttpError via errorResponse', async () => {
    mockedIsAdmin.mockResolvedValue(true);
    mockedIsSuperAdmin.mockResolvedValue(false);
    mockedReservation.reject.mockRejectedValue(new HttpError(404, 'Reservation not found'));

    const result = await routes.reject({ body: { itemId: 1, reservationId: '5' }, req });

    expect(result).toEqual({ status: 404, body: { message: 'Reservation not found' } });
  });
});

describe('getWithOrgPath', () => {
  it('returns 401 when the user is neither an admin nor a super admin', async () => {
    mockedIsAdmin.mockResolvedValue(false);
    mockedIsSuperAdmin.mockResolvedValue(false);

    const result = await routes.getWithOrgPath({ params: { orgPath: 'org1' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedReservation.getAllByOrgPath).not.toHaveBeenCalled();
  });

  it('returns the reservation values for admins', async () => {
    mockedIsAdmin.mockResolvedValue(true);
    mockedIsSuperAdmin.mockResolvedValue(false);
    const values = { id: '7', status: 'accepted' };
    mockedReservation.getAllByOrgPath.mockResolvedValue([{ values }]);

    const result = await routes.getWithOrgPath({ params: { orgPath: 'org1' }, req });

    expect(mockedReservation.getAllByOrgPath).toHaveBeenCalledWith('org1');
    expect(result).toEqual({ status: 200, body: [values] });
  });
});
