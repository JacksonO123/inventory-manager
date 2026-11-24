import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute } from '@ts-rest/next';
import { unauthorizedResponse } from './utils/constants';
import { incomingHeadersToHeaders } from './utils/headers';
import { auth } from '../auth';
import { errorResponse } from './utils/errors';
import { hoursBetween } from '../../utils/utils';
import { MAX_FREE_RESERVE_HOURS } from '../../utils/constants';
import { Reservation } from '../model/Reservation';
import { SuperAdmin } from '../model/SuperAdmin';
import { User } from '../model/User';
import { Admin } from '../model/Admin';

export const reservationRoute = createNextRoute(rootWebRouter.reservation, {
  addReservation: async ({ body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      if (body.event.end <= body.event.start) {
        return { status: 500, body: { message: 'End date is less than or equal to start date' } };
      }

      const numHours = hoursBetween(body.event.start, body.event.end);
      if (numHours > MAX_FREE_RESERVE_HOURS && body.event.status !== 'pending') {
        return { status: 500, body: { message: 'Event too long, send a request instead' } };
      }

      const event = await Reservation.create(body.event, body.borrowerId, body.event.status);

      if (event === null) {
        return { status: 409, body: { message: 'Reservation overlaps' } };
      }

      return { status: 200, body: { id: event.values.id } };
    } catch (err) {
      return errorResponse(err);
    }
  },
  getByItemIdAndOrgPath: async ({ params, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const items = await Reservation.getByItemIdAndOrgPath(params.itemId, params.orgPath);

      return { status: 200, body: items.map((res) => res.values) };
    } catch (err) {
      return errorResponse(err);
    }
  },
  getByItemIdAndOrgPathBetweenDates: async ({ req, body, params }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const [isSuperAdmin, memberOfOrg] = await Promise.all([
        SuperAdmin.isSuperAdmin(session.user.id),
        User.isMemberOfOrgById(session.user.id, params.orgId)
      ]);

      if (!isSuperAdmin && !memberOfOrg) {
        return unauthorizedResponse;
      }

      const reservations = await Reservation.getByItemIdAndOrgIdBetweenDates(
        params.orgId,
        params.itemId,
        body.start,
        body.end
      );

      return {
        status: 200,
        body: reservations.map((reservation) => ({ ...reservation, id: reservation.id + '' }))
      };
    } catch (err) {
      return errorResponse(err);
    }
  },
  getReservationRequestsForOrg: async ({ req, params }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const [isAdmin, isSuperAdmin] = await Promise.all([
        Admin.isAdmin(session.user.id),
        SuperAdmin.isSuperAdmin(session.user.id)
      ]);

      if (!isAdmin && !isSuperAdmin) {
        return unauthorizedResponse;
      }

      const requests = await Reservation.getRequestsByOrgPath(params.orgPath);

      return {
        status: 200,
        body: requests
      };
    } catch (err) {
      return errorResponse(err);
    }
  },
  getOrgIdBetweenDates: async ({ req, params, body }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const [isSuperAdmin, memberOfOrg] = await Promise.all([
        SuperAdmin.isSuperAdmin(session.user.id),
        User.isMemberOfOrgById(session.user.id, params.orgId)
      ]);

      if (!isSuperAdmin && !memberOfOrg) {
        return unauthorizedResponse;
      }

      const reservations = await Reservation.getByOrgIdBetweenDates(
        params.orgId,
        body.start,
        body.end
      );

      return {
        status: 200,
        body: reservations.map((reservation) => ({ ...reservation, id: reservation.id + '' }))
      };
    } catch (err) {
      return errorResponse(err);
    }
  }
});
