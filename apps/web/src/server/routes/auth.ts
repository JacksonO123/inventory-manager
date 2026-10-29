import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute } from '@ts-rest/next';
import { BasicUser } from '../model/BasicUser';

export const basicAuthRoute = createNextRoute(rootWebRouter.auth, {
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
