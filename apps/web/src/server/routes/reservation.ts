import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute } from '@ts-rest/next';
import { unauthorizedResponse } from './utils/constants';
import { incomingHeadersToHeaders } from './utils/headers';
import { auth } from '../auth';
import { errorResponse } from './utils/errors';

export const reservationRoute = createNextRoute(rootWebRouter.reservation, {
  addReservation: async ({ body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      return { status: 200, body: undefined };
    } catch (err) {
      return errorResponse(err);
    }
  }
});
