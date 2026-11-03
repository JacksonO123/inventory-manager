import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute } from '@ts-rest/next';
import { errorResponse } from './utils/errors';
import { Org } from '../model/Org';
import { unauthorizedResponse } from './utils/constants';
import { auth } from '../auth';
import { incomingHeadersToHeaders } from './utils/headers';

export const orgRoute = createNextRoute(rootWebRouter.orgRouter, {
  getAll: async ({ req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const orgs = await Org.getAll();
      return { status: 200, body: orgs };
    } catch (err) {
      return errorResponse(err);
    }
  },
  create: async ({ body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const org = await Org.create(body);
      return { status: 200, body: { id: org.values.id, location: org.values.location } };
    } catch (err) {
      return errorResponse(err);
    }
  }
});
