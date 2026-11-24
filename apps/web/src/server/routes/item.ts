import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute } from '@ts-rest/next';
import { Item } from '../model/Item';
import { errorResponse } from './utils/errors';
import { auth } from '../auth';
import { incomingHeadersToHeaders } from './utils/headers';
import { unauthorizedResponse } from './utils/constants';

export const nextItemRoute = createNextRoute(rootWebRouter.item, {
  createItem: async ({ body }) => {
    try {
      const { orgId, ...partialItem } = body;
      const createdItem = await Item.create(partialItem, orgId);
      return {
        status: 200,
        body: {
          id: createdItem.values.id,
          is_available: createdItem.values.is_available,
          is_lent_out: createdItem.values.is_lent_out,
          is_damaged: createdItem.values.is_damaged
        }
      };
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  },

  getItemsFromOrgPath: async ({ params }) => {
    try {
      const items = await Item.getAllFromOrgPath(params.orgPath);
      return { status: 200, body: items.map((item) => item.values) };
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  },

  checkOut: async ({ params, body }) => {
    try {
      await Item.checkOut(params.id, body.borrowerId);
      return { status: 200, body: { id: params.id } };
    } catch (err) {
      return errorResponse(err);
    }
  },

  returnItem: async ({ params }) => {
    try {
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
  editItem: async ({ params, body }) => {
    try {
      await Item.edit(params.id, body);
      return { status: 200, body: { id: params.id } };
    } catch (err) {
      return errorResponse(err);
    }
  },

  deleteItem: async ({ params }) => {
    try {
      await Item.delete(params.id);
      return { status: 200, body: { id: params.id } };
    } catch (err) {
      return errorResponse(err);
    }
  }
});
