import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute, createNextRouter } from '@ts-rest/next';
import { db } from '../../server/db';
import { itemTable } from '@invm/inventory-db-utils';

const nextItemRoute = createNextRoute(rootWebRouter.item, {
  createItem: async ({ body }) => {
    try {
      const [createdItem] = await db.insert(itemTable).values(body).returning();
      return { status: 200, body: createdItem };
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
