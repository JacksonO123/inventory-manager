import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute } from '@ts-rest/next';
import { Item } from '../model/Item';

export const nextItemRoute = createNextRoute(rootWebRouter.item, {
  createItem: async ({ body }) => {
    try {
      const createdItem = await Item.create(body);
      return {
        status: 200,
        body: { id: createdItem.values.id, status: createdItem.values.status }
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
      const result = await Item.checkOut(params.id, body.borrowerId);
      if (result.ok) {
        return { status: 200, body: result.item.values };
      }
      switch (result.reason) {
        case 'item_not_found':
          return { status: 404, body: { message: 'Item not found' } };
        case 'borrower_not_found':
          return { status: 404, body: { message: 'Borrower not found' } };
        case 'not_available':
          return { status: 409, body: { message: 'Item is not available' } };
      }
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  },

  returnItem: async ({ params, body }) => {
    try {
      const result = await Item.return(params.id, body.borrowerId);
      if (result.ok) {
        return { status: 200, body: result.item.values };
      }
      switch (result.reason) {
        case 'item_not_found':
          return { status: 404, body: { message: 'Item not found' } };
        case 'not_checked_out':
          return { status: 409, body: { message: 'Item is not checked out by this borrower' } };
      }
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  }
});
