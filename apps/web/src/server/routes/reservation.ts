import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute } from '@ts-rest/next';
import { unauthorizedResponse } from './utils/constants';
import { incomingHeadersToHeaders } from './utils/headers';
import { auth } from '../auth';
import { errorResponse } from './utils/errors';
import { hoursBetween } from '../../utils/utils';
import { MAX_FREE_RESERVE_HOURS } from '../../utils/constants';
import { CalendarEvent } from '../model/Event';

export const reservationRoute = createNextRoute(rootWebRouter.reservation, {
  addReservation: async ({ body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      if (body.event.end <= body.event.start) {
        return { status: 500, body: { message: 'End date is less than or equal to start date' } };
      }

      const numHours = hoursBetween(body.event.start, body.event.end);
      if (numHours > MAX_FREE_RESERVE_HOURS) {
        return { status: 500, body: { message: 'Event too long, send a request instead' } };
      }

      const event = await CalendarEvent.create(body.event, 'accepted');

      return { status: 200, body: { id: event.values.id } };
    } catch (err) {
      return errorResponse(err);
    }
  }
});
