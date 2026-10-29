import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute } from '@ts-rest/next';
import { getProtectedError } from './utils/protected';
import { SuperAdmin } from '../model/SuperAdmin';
import { auth } from '../auth';
import { headersFromRawHeaders } from './utils/headers';

export const superAdminRoute = createNextRoute(rootWebRouter.superAdmin, {
  isSuperAdmin: async ({ query, headers, req }) => {
    const jsHeaders = headersFromRawHeaders(req.rawHeaders);

    try {
      let allowed = false;

      if (headers.authorization) {
        const protectedError = getProtectedError(headers);
        if (protectedError !== null) return protectedError;
        allowed = true;
      } else {
        const session = await auth.api.getSession({ headers: jsHeaders });
        if (session?.user.id) {
          allowed = await SuperAdmin.isSuperAdmin(session.user.id);
        }
      }

      if (!allowed) {
        return { status: 401, body: { message: '401 unauthorized' } };
      }

      const isAdmin = await SuperAdmin.isSuperAdmin(query.id);
      return { status: 200, body: { isAdmin } };
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  }
});
