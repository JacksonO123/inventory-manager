import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute, createNextRouter } from '@ts-rest/next';
import { nextItemRoute } from '../../server/routes/item';
import { adminRoute } from '../../server/routes/admin';
import { superAdminRoute } from '../../server/routes/super-admin';
import { orgRoute } from '../../server/routes/org';
import { reservationRoute } from '../../server/routes/reservation';
import { userRoute } from '../../server/routes/user';

const router = createNextRoute(rootWebRouter, {
  debug: async () => {
    return { status: 200, body: 'success' };
  },

  item: nextItemRoute,
  admin: adminRoute,
  superAdmin: superAdminRoute,
  organizations: orgRoute,
  reservation: reservationRoute,
  user: userRoute
});

export default createNextRouter(rootWebRouter, router);
