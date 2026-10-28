import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute } from '@ts-rest/next';
import { Admin } from '../model/Admin';
import { getProtectedError } from './utils/protected';

export const superAdminRoute = createNextRoute(rootWebRouter.superAdmin, {
  isSuperAdmin: async ({ query, headers }) => {
    try {
      const protectedError = getProtectedError(headers);
      if (protectedError !== null) return protectedError;

      const isAdmin = await Admin.isAdmin(query.id);
      return { status: 200, body: { isAdmin } };
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  }
});
