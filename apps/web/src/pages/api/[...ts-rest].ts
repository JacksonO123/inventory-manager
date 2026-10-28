import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute, createNextRouter } from '@ts-rest/next';
import { Item } from '../../server/model/Item';
import { BasicUser } from '../../server/model/BasicUser';

const nextItemRoute = createNextRoute(rootWebRouter.item, {
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

const basicAuthRoute = createNextRoute(rootWebRouter.auth, {
  createUser: async ({ body }) => {
    try {
      const userId = await BasicUser.create(body);
      return { status: 200, body: { id: userId } };
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  },
  getUser: async ({ query }) => {
    try {
      const userInfo = await BasicUser.getByEmail(query.email);
      return { status: 200, body: { user: userInfo } };
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  }
});

const router = createNextRoute(rootWebRouter, {
  debug: async () => {
    return { status: 200, body: 'success' };
  },

  item: nextItemRoute,
  auth: basicAuthRoute
});

export default createNextRouter(rootWebRouter, router);
