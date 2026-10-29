import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute } from '@ts-rest/next';
import { Admin } from '../model/Admin';
import { getProtectedError } from './utils/protected';
import { SuperAdmin } from '../model/SuperAdmin';

export const adminRoute = createNextRoute(rootWebRouter.admin, {
  isAdmin: async ({ query, headers }) => {
    try {
      const protectedError = getProtectedError(headers);
      if (protectedError !== null) return protectedError;

      let isAdmin = await Admin.isAdmin(query.id);
      if (!isAdmin) {
        isAdmin = await SuperAdmin.isSuperAdmin(query.id);
      }

      return { status: 200, body: { isAdmin } };
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  }
});
