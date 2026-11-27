import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute } from '@ts-rest/next';
import { Item } from '../model/Item';
import { errorResponse } from './utils/errors';
import { auth } from '../auth';
import { incomingHeadersToHeaders } from './utils/headers';
import { unauthorizedResponse } from './utils/constants';
import { SuperAdmin } from '../model/SuperAdmin';

export const nextItemRoute = createNextRoute(rootWebRouter.item, {
  createItem: async ({ body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const { orgId, ...partialItem } = body;
      const createdItem = await Item.create(partialItem, orgId);
      return {
        status: 200,
        body: { id: createdItem.values.id, status: createdItem.values.status }
      };
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  },

  getByIdAndOrgPath: async ({ params, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const item = await Item.getByIdAndOrgPath(params.id, params.orgPath);

      return { status: 200, body: item.values };
    } catch (err) {
      return errorResponse(err);
    }
  },

  getAll: async ({ req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const isSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!isSuperAdmin) return unauthorizedResponse;

      const items = await Item.getAllGroupByOrgs();

      return { status: 200, body: items };
    } catch (err) {
      return errorResponse(err);
    }
  }
});
