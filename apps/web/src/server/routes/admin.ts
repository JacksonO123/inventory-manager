import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute } from '@ts-rest/next';
import { Admin, AdminWithEmail } from '../model/Admin';
import { SuperAdmin } from '../model/SuperAdmin';
import { auth } from '../auth';
import { unauthorizedResponse } from './utils/constants';
import { User } from '../model/User';
import { incomingHeadersToHeaders } from './utils/headers';

export const adminRoute = createNextRoute(rootWebRouter.admin, {
  isAdmin: async ({ body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const queriedUser = await User.getById(body.id);
      if (queriedUser === undefined) return unauthorizedResponse;

      const userIsSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);

      if (userIsSuperAdmin || queriedUser.email === session.user.email) {
        let isAdmin = await Admin.isAdmin(body.id);
        if (!isAdmin) {
          isAdmin = await SuperAdmin.isSuperAdmin(body.id);
        }

        return { status: 200, body: { isAdmin } };
      } else {
        return unauthorizedResponse;
      }
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  },
  addAdmin: async ({ body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const userIsSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!userIsSuperAdmin) return unauthorizedResponse;

      const queriedUser = await User.getByEmail(body.email);
      if (queriedUser === undefined) {
        return { status: 500, body: { message: 'User does not exist' } };
      }

      const admin = await Admin.create(queriedUser.id);
      if (admin === undefined) {
        return { status: 500, body: { message: 'Failed to create admin' } };
      }

      return { status: 200, body: { user_id: admin.values.user_id, id: admin.values.id } };
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  },
  getAllWithEmail: async ({ req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const userIsSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!userIsSuperAdmin) return unauthorizedResponse;

      const allAdmins = await AdminWithEmail.getAll();
      return {
        status: 200,
        body: {
          admins: allAdmins.map((item) => ({
            id: item.values.id,
            user_id: item.values.user_id,
            email: item.email
          }))
        }
      };
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  },
  revokeAdmin: async ({ body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const userIsSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!userIsSuperAdmin) return unauthorizedResponse;

      await Admin.revoke(body.id);
      return { status: 200 };
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  },
  promote: async ({ body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const userIsSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!userIsSuperAdmin) return unauthorizedResponse;

      const admin = await Admin.getById(body.id);
      if (!admin) {
        return { status: 500, body: { message: 'Failed to promote, user is not an admin' } };
      }

      await Admin.revoke(body.id);
      const newSuperAdmin = await SuperAdmin.create(admin.user_id);

      return { status: 200, body: { id: newSuperAdmin.values.id } };
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  }
});
