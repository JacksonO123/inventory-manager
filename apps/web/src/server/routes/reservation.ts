import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute } from '@ts-rest/next';
import { unauthorizedResponse } from './utils/constants';
import { incomingHeadersToHeaders } from './utils/headers';
import { auth } from '../auth';
import { errorResponse } from './utils/errors';
import { hoursBetween } from '../../utils/utils';
import { MAX_FREE_RESERVE_HOURS } from '../../utils/constants';
import { Reservation } from '../model/Reservation';

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

      const event = await Reservation.create(body.event, body.event.status);

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
  }
});
