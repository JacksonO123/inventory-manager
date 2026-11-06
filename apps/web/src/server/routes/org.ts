import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute } from '@ts-rest/next';
import { errorResponse } from './utils/errors';
import { Org } from '../model/Org';
import { unauthorizedResponse } from './utils/constants';
import { auth } from '../auth';
import { incomingHeadersToHeaders } from './utils/headers';
import { OrgPositions } from '../model/OrgPositions';

export const orgRoute = createNextRoute(rootWebRouter.organizations, {
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
      return { status: 200, body: { id: org.values.id } };
    } catch (err) {
      return errorResponse(err);
    }
  },
  getPositions: async ({ req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const ids = await OrgPositions.getByUserId(session.user.id);

      return { status: 200, body: ids.values.positions };
    } catch (err) {
      return errorResponse(err);
    }
  }
});
