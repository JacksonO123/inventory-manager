import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute } from '@ts-rest/next';
import { Item } from '../model/Item';
import { errorResponse } from './utils/errors';

export const nextItemRoute = createNextRoute(rootWebRouter.item, {
  createItem: async ({ body }) => {
    try {
      const createdItem = await Item.create(body);
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

  getItems: async () => {
    try {
      const items = await Item.getAll();
      return { status: 200, body: items };
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
