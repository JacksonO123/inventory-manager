import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute } from '@ts-rest/next';
import { SuperAdmin, SuperAdminWithEmail } from '../model/SuperAdmin';
import { auth } from '../auth';
import { unauthorizedResponse } from './utils/constants';
import { User } from '../model/User';
import { incomingHeadersToHeaders } from './utils/headers';
import { Admin } from '../model/Admin';

export const superAdminRoute = createNextRoute(rootWebRouter.superAdmin, {
  isSuperAdmin: async ({ body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const queriedUser = await User.getById(body.id);
      if (!queriedUser) return unauthorizedResponse;

      const userIsSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!userIsSuperAdmin) {
        if (queriedUser.email === session.user.email) {
          return { status: 200, body: { isAdmin: false } };
        }
        return unauthorizedResponse;
      }

      const isAdmin = await SuperAdmin.isSuperAdmin(body.id);
      return { status: 200, body: { isAdmin } };
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  },
  isValidSuperAdminEmail: async ({ body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const isSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!isSuperAdmin) return unauthorizedResponse;

      const queriedUser = await User.getByEmail(body.email);
      if (!queriedUser) {
        return { status: 200, body: { status: 'no_user_exists' } };
      }

      const isQueriedUserSuperAdmin = await SuperAdmin.isSuperAdmin(queriedUser.id);
      if (isQueriedUserSuperAdmin) {
        return { status: 200, body: { status: 'super_admin_exists' } };
      }

      return { status: 200, body: { status: 'success' } };
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  },
  isValidAdminEmail: async ({ body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const isSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!isSuperAdmin) return unauthorizedResponse;

      const queriedUser = await User.getByEmail(body.email);
      if (!queriedUser) {
        return { status: 200, body: { status: 'no_user_exists' } };
      }

      const isQueriedUserAdmin = await Admin.isAdmin(queriedUser.id);
      if (isQueriedUserAdmin) {
        return { status: 200, body: { status: 'admin_exists' } };
      }

      return { status: 200, body: { status: 'success' } };
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  },
  addSuperAdmin: async ({ body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const userIsSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!userIsSuperAdmin) return unauthorizedResponse;

      const queriedUser = await User.getByEmail(body.email);
      if (queriedUser === undefined) {
        return { status: 500, body: { message: 'User does not exist' } };
      }

      const admin = await SuperAdmin.create(queriedUser.id);
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

      const allAdmins = await SuperAdminWithEmail.getAll();
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

      await SuperAdmin.revoke(body.id);
      return { status: 200 };
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  },
  demote: async ({ body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const userIsSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!userIsSuperAdmin) return unauthorizedResponse;

      const superAdmin = await SuperAdmin.getById(body.id);
      if (!superAdmin) {
        return { status: 500, body: { message: 'Failed to demote, user is not a super admin' } };
      }

      await SuperAdmin.revoke(body.id);
      const newAdmin = await Admin.create(superAdmin.user_id);

      return { status: 200, body: { id: newAdmin.values.id } };
    } catch (err) {
      return { status: 500, body: { message: err + '' } };
    }
  }
});
