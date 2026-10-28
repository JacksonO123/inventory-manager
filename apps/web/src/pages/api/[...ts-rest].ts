import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute, createNextRouter } from '@ts-rest/next';
import { nextItemRoute } from '../../server/routes/item';
import { basicAuthRoute } from '../../server/routes/auth';
import { adminRoute } from '../../server/routes/admin';

const router = createNextRoute(rootWebRouter, {
  debug: async () => {
    return { status: 200, body: 'success' };
  },

  item: nextItemRoute,
  auth: basicAuthRoute,
  admin: adminRoute
});

export default createNextRouter(rootWebRouter, router);
