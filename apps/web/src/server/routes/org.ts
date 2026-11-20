import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute } from '@ts-rest/next';
import { errorResponse } from './utils/errors';
import { Org } from '../model/Org';
import { unauthorizedResponse } from './utils/constants';
import { auth } from '../auth';
import { incomingHeadersToHeaders } from './utils/headers';
import { OrgPositions } from '../model/OrgPositions';
import { SuperAdmin } from '../model/SuperAdmin';
import { Admin, AdminWithEmail } from '../model/Admin';
import { OrgMember } from '../model/OrgMember';
import { User } from '../model/User';

export const orgRoute = createNextRoute(rootWebRouter.organizations, {
  getAll: async ({ req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const isSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!isSuperAdmin) return unauthorizedResponse;

      const orgs = await Org.getAll();
      return { status: 200, body: orgs };
    } catch (err) {
      return errorResponse(err);
    }
  },
  create: async ({ body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const isSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!isSuperAdmin) return unauthorizedResponse;

      const org = await Org.create(body);
      return { status: 200, body: { id: org.values.id } };
    } catch (err) {
      return errorResponse(err);
    }
  },
  getPositions: async ({ req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const isSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!isSuperAdmin) return unauthorizedResponse;

      const ids = await OrgPositions.getByUserId(session.user.id);

      return { status: 200, body: ids.values.positions };
    } catch (err) {
      return errorResponse(err);
    }
  },
  setPositions: async ({ body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const isSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!isSuperAdmin) return unauthorizedResponse;

      await OrgPositions.updateByUserId(session.user.id, body.positions);

      return { status: 200, body: undefined };
    } catch (err) {
      return errorResponse(err);
    }
  },
  update: async ({ body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const isSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!isSuperAdmin) return unauthorizedResponse;

      await Org.update(body);

      return { status: 200, body: undefined };
    } catch (err) {
      return errorResponse(err);
    }
  },
  delete: async ({ body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const isSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!isSuperAdmin) return unauthorizedResponse;

      await Org.deleteById(body.id);

      return { status: 200, body: undefined };
    } catch (err) {
      return errorResponse(err);
    }
  },
  getByPath: async ({ params, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const isSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!isSuperAdmin) return unauthorizedResponse;

      const org = await Org.getByPath(params.path);

      return { status: 200, body: { org: org.values } };
    } catch (err) {
      return errorResponse(err);
    }
  },
  getInfoForAdmin: async ({ req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const info = await Org.getInfoFromAdminMemberId(session.user.id);

      return {
        status: 200,
        body: info.map((group) => ({
          org: group.org.values,
          items: group.items.map((item) => item.values)
        }))
      };
    } catch (err) {
      return errorResponse(err);
    }
  },
  getAdminMembers: async ({ params, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const isSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!isSuperAdmin) return unauthorizedResponse;

      const members = await AdminWithEmail.getMembersOfOrgByPath(params.orgPath);
      console.log('HERE 1');

      return {
        status: 200,
        body: members.map((member) => {
          const { id: _, ...values } = member.values;
          return { ...values, email: member.email };
        })
      };
    } catch (err) {
      return errorResponse(err);
    }
  },
  addAdminMember: async ({ params, body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const isSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!isSuperAdmin) return unauthorizedResponse;

      const [user, admin] = await Promise.all([
        User.getByEmail(body.email),
        Admin.isAdminByEmail(body.email)
      ]);

      if (user === undefined) {
        return { status: 404, body: { message: 'User not found' } };
      }

      if (!admin) {
        return { status: 500, body: { message: 'User to add is not an admin' } };
      }

      const member = await OrgMember.createWithOrgPathAndEmail(params.orgPath, body.email);

      return { status: 200, body: { userId: member.values.userId } };
    } catch (err) {
      return errorResponse(err);
    }
  },
  removeAdminMember: async ({ params, body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const isSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!isSuperAdmin) return unauthorizedResponse;

      const [user, admin] = await Promise.all([
        User.getById(body.userId),
        Admin.isAdmin(body.userId)
      ]);

      if (user === undefined) {
        return { status: 404, body: { message: 'User not found' } };
      }

      if (!admin) {
        return {
          status: 500,
          body: { message: 'Cannot remove member as admin, they are not admin' }
        };
      }

      await OrgMember.removeByIdFromOrgByPath(params.orgPath, body.userId);

      return { status: 200, body: undefined };
    } catch (err) {
      return errorResponse(err);
    }
  },
  isValidNewAdminMember: async ({ body, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const isSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!isSuperAdmin) return unauthorizedResponse;

      const [user, admin] = await Promise.all([
        User.getByEmail(body.email),
        Admin.getByUserId(body.email)
      ]);

      if (user === undefined) {
        return { status: 200, body: { valid: false, error: 'User does not exist' } };
      }

      if (admin === undefined) {
        return { status: 200, body: { valid: false, error: 'User is not admin' } };
      }

      const belongsTo = await OrgMember.getBelongsToPaths(admin.userId);
      if (belongsTo.includes(body.orgPath)) {
        return { status: 200, body: { valid: false, error: 'User already belongs to org' } };
      }

      return { status: 200, body: { valid: true } };
    } catch (err) {
      return errorResponse(err);
    }
  },
  addUserMember: async ({ req, body, params }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const isSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!isSuperAdmin) return unauthorizedResponse;

      const [user, admin, superAdmin] = await Promise.all([
        User.getByEmail(body.email),
        Admin.isAdminByEmail(body.email),
        SuperAdmin.isSuperAdminByEmail(body.email)
      ]);

      if (user === undefined) {
        return { status: 404, body: { message: 'User not found' } };
      }

      if (admin || superAdmin) {
        return { status: 500, body: { message: 'Cannot add admin as user member' } };
      }

      const member = await OrgMember.createWithOrgPathAndEmail(params.orgPath, body.email);

      return { status: 200, body: { userId: member.values.userId } };
    } catch (err) {
      return errorResponse(err);
    }
  },
  removeUserMember: async ({ req, body, params }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const isSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!isSuperAdmin) return unauthorizedResponse;

      const [user, admin, superAdmin] = await Promise.all([
        User.getById(body.userId),
        Admin.isAdmin(body.userId),
        SuperAdmin.isSuperAdmin(body.userId)
      ]);

      if (user === undefined) {
        return { status: 404, body: { message: 'User not found' } };
      }

      if (admin || superAdmin) {
        return { status: 500, body: { message: 'Cannot remove admin as user member' } };
      }

      await OrgMember.removeByIdFromOrgByPath(params.orgPath, body.userId);

      return { status: 200, body: undefined };
    } catch (err) {
      return errorResponse(err);
    }
  },
  isValidNewUserMember: async ({ req, body }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const isSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!isSuperAdmin) return unauthorizedResponse;

      const [user, admin, superAdmin] = await Promise.all([
        User.getByEmail(body.email),
        Admin.isAdminByEmail(body.email),
        SuperAdmin.isSuperAdminByEmail(body.email)
      ]);

      if (user === undefined) {
        return { status: 200, body: { valid: false, error: 'User does not exist' } };
      }

      if (admin || superAdmin) {
        return { status: 200, body: { valid: false, error: 'User is an admin' } };
      }

      return { status: 200, body: { valid: true } };
    } catch (err) {
      return errorResponse(err);
    }
  },
  getUserMembers: async ({ params, req }) => {
    try {
      const session = await auth.api.getSession({ headers: incomingHeadersToHeaders(req.headers) });
      if (session === null) return unauthorizedResponse;

      const isSuperAdmin = await SuperAdmin.isSuperAdmin(session.user.id);
      if (!isSuperAdmin) return unauthorizedResponse;

      const members = await User.getMembersOfOrgByPath(params.orgPath);
      console.log('HERE', members);

      return {
        status: 200,
        body: members.map((member) => {
          return { userId: member.values.id, email: member.values.email };
        })
      };
    } catch (err) {
      return errorResponse(err);
    }
  }
});
