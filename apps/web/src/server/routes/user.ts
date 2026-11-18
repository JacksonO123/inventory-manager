import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute } from '@ts-rest/next';
import { errorResponse } from './utils/errors';
import { auth } from '../auth';
import { incomingHeadersToHeaders } from './utils/headers';
import { unauthorizedResponse } from './utils/constants';
import { Admin } from '../model/Admin';
import { SuperAdmin } from '../model/SuperAdmin';

export const userRoute = createNextRoute(rootWebRouter.user, {
  getAdminStatus: async ({ req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const [admin, superAdmin] = await Promise.all([
        Admin.isAdmin(session.user.id),
        SuperAdmin.isSuperAdmin(session.user.id)
      ]);

      return {
        status: 200,
        body: { admin: admin || superAdmin, superAdmin }
      };
    } catch (err) {
      return errorResponse(err);
    }
  }
});
