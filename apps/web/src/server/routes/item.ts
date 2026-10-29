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
  }
});
