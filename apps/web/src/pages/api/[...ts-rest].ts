import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute, createNextRouter } from '@ts-rest/next';
import { Item } from '../../server/model/Item';

const nextItemRoute = createNextRoute(rootWebRouter.item, {
  createItem: async ({ body }) => {
    try {
      const createdItem = await Item.create(body);
      return { status: 200, body: { id: createdItem.values.id } };
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

const router = createNextRoute(rootWebRouter, {
  debug: async () => {
    return { status: 200, body: 'success' };
  },

  item: nextItemRoute
});

export default createNextRouter(rootWebRouter, router);
