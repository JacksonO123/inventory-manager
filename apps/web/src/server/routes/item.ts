import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute } from '@ts-rest/next';
import { Item } from '../model/Item';
import { errorResponse } from './utils/errors';
import { auth } from '../auth';
import { incomingHeadersToHeaders } from './utils/headers';
import { unauthorizedResponse } from './utils/constants';
import { Admin } from '../model/Admin';
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

  getItemsFromOrgPath: async ({ params, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const items = await Item.getAllFromOrgPath(params.orgPath);
      return { status: 200, body: items };
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  },

  checkOut: async ({ params, body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      await Item.checkOut(params.id, body.borrowerId);
      return { status: 200, body: { id: params.id } };
    } catch (err) {
      return errorResponse(err);
    }
  },

  returnItem: async ({ params, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      await Item.return(params.id);
      return { status: 200, body: { id: params.id } };
    } catch (err) {
      return errorResponse(err);
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

  getItemsFromOrgPathWithReservationsBetweenDates: async ({ params, body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const [admin, superAdmin] = await Promise.all([
        Admin.isAdmin(session.user.id),
        SuperAdmin.isSuperAdmin(session.user.id)
      ]);

      if (!admin && !superAdmin) {
        return unauthorizedResponse;
      }

      const info = await Item.getAllFromOrgPathWithReservationsBetweenDates(
        params.orgPath,
        body.start,
        body.end
      );

      return { status: 200, body: info };
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
