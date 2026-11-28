/**
 * @jest-environment node
 */
import { orgRoute } from './org';
import { auth } from '../auth';
import { Org } from '../model/Org';
import { OrgPositions } from '../model/OrgPositions';
import { SuperAdmin } from '../model/SuperAdmin';
import { Admin, AdminWithEmail } from '../model/Admin';
import { OrgMember } from '../model/OrgMember';
import { User } from '../model/User';

jest.mock('@ts-rest/next', () => ({ createNextRoute: (_router: unknown, handlers: unknown) => handlers }));
jest.mock('../auth', () => ({ auth: { api: { getSession: jest.fn() } } }));
jest.mock('../model/Org', () => ({
  Org: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
    getByPath: jest.fn(),
    getInfoFromAdminUserId: jest.fn(),
    getOrgsForAdminUserId: jest.fn()
  }
}));
jest.mock('../model/OrgPositions', () => ({
  OrgPositions: { getByUserId: jest.fn(), updateByUserId: jest.fn() }
}));
jest.mock('../model/SuperAdmin', () => ({
  SuperAdmin: { isSuperAdmin: jest.fn(), isSuperAdminByEmail: jest.fn() }
}));
jest.mock('../model/Admin', () => ({
  Admin: { isAdmin: jest.fn(), isAdminByEmail: jest.fn(), getByUserEmail: jest.fn() },
  AdminWithEmail: { getMembersOfOrgByPath: jest.fn() }
}));
jest.mock('../model/OrgMember', () => ({
  OrgMember: {
    createWithOrgPathAndEmail: jest.fn(),
    removeByIdFromOrgByPath: jest.fn(),
    getBelongsToPaths: jest.fn()
  }
}));
jest.mock('../model/User', () => ({
  User: { getByEmail: jest.fn(), getById: jest.fn(), getMembersOfOrgByPath: jest.fn() }
}));

const mockedGetSession = (auth as unknown as { api: { getSession: jest.Mock } }).api.getSession;
const mockedOrg = Org as unknown as {
  getAll: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  deleteById: jest.Mock;
  getByPath: jest.Mock;
  getInfoFromAdminUserId: jest.Mock;
  getOrgsForAdminUserId: jest.Mock;
};
const mockedOrgPositions = OrgPositions as unknown as { getByUserId: jest.Mock; updateByUserId: jest.Mock };
const mockedIsSuperAdmin = (SuperAdmin as unknown as { isSuperAdmin: jest.Mock }).isSuperAdmin;
const mockedAdmin = Admin as unknown as {
  isAdmin: jest.Mock;
  isAdminByEmail: jest.Mock;
  getByUserEmail: jest.Mock;
};
const mockedAdminWithEmail = AdminWithEmail as unknown as { getMembersOfOrgByPath: jest.Mock };
const mockedOrgMember = OrgMember as unknown as {
  createWithOrgPathAndEmail: jest.Mock;
  removeByIdFromOrgByPath: jest.Mock;
  getBelongsToPaths: jest.Mock;
};
const mockedUser = User as unknown as {
  getByEmail: jest.Mock;
  getById: jest.Mock;
  getMembersOfOrgByPath: jest.Mock;
};

const session = { user: { id: 'u1', email: 'a@b.com' } };
const req = { headers: {} } as unknown as Request;

type Handler = (input: { body?: unknown; params?: unknown; req: Request }) => Promise<{
  status: number;
  body?: unknown;
}>;
type RouteName =
  | 'addAdminMember'
  | 'addUserMember'
  | 'create'
  | 'delete'
  | 'getAdminMembers'
  | 'getAll'
  | 'getByPath'
  | 'getInfoForAdmin'
  | 'getOrgsForAdmin'
  | 'getPositions'
  | 'getUserMembers'
  | 'isValidNewAdminMember'
  | 'isValidNewUserMember'
  | 'removeAdminMember'
  | 'removeUserMember'
  | 'setPositions'
  | 'update';
const routes = orgRoute as unknown as Record<RouteName, Handler>;

beforeEach(() => {
  jest.resetAllMocks();
  mockedGetSession.mockResolvedValue(session);
  // Default: the session user is a super admin and an admin, so every gate passes.
  mockedIsSuperAdmin.mockResolvedValue(true);
  mockedAdmin.isAdmin.mockResolvedValue(true);
});

describe('getAll', () => {
  it('returns 401 when the session is not a super admin', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);

    const result = await routes.getAll({ req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedOrg.getAll).not.toHaveBeenCalled();
  });

  it('returns all orgs for a super admin', async () => {
    const orgs = [{ id: 1, path: 'org1' }];
    mockedOrg.getAll.mockResolvedValue(orgs);

    const result = await routes.getAll({ req });

    expect(result).toEqual({ status: 200, body: orgs });
  });
});

describe('create', () => {
  it('returns 401 when the session is not a super admin', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);

    const result = await routes.create({ body: { name: 'org1' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedOrg.create).not.toHaveBeenCalled();
  });

  it('creates the org and returns its id', async () => {
    const body = { name: 'org1', description: null, svgDataUrl: null, path: 'org1' };
    mockedOrg.create.mockResolvedValue({ values: { id: 1 } });

    const result = await routes.create({ body, req });

    expect(mockedOrg.create).toHaveBeenCalledWith(body);
    expect(result).toEqual({ status: 200, body: { id: 1 } });
  });
});

describe('getPositions', () => {
  it('returns 401 when the session is not a super admin', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);

    const result = await routes.getPositions({ req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
  });

  it('returns the session user positions', async () => {
    mockedOrgPositions.getByUserId.mockResolvedValue({ values: { positions: [1, 2] } });

    const result = await routes.getPositions({ req });

    expect(mockedOrgPositions.getByUserId).toHaveBeenCalledWith('u1');
    expect(result).toEqual({ status: 200, body: [1, 2] });
  });
});

describe('setPositions', () => {
  it('returns 401 when the session is not a super admin', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);

    const result = await routes.setPositions({ body: { positions: [1] }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedOrgPositions.updateByUserId).not.toHaveBeenCalled();
  });

  it('updates the session user positions', async () => {
    mockedOrgPositions.updateByUserId.mockResolvedValue(undefined);

    const result = await routes.setPositions({ body: { positions: [1, 3] }, req });

    expect(mockedOrgPositions.updateByUserId).toHaveBeenCalledWith('u1', [1, 3]);
    expect(result).toEqual({ status: 200, body: undefined });
  });
});

describe('update', () => {
  it('returns 401 when the session is not a super admin', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);

    const result = await routes.update({ body: { id: 1, name: 'renamed' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedOrg.update).not.toHaveBeenCalled();
  });

  it('updates the org from the body', async () => {
    const body = { id: 1, name: 'renamed' };
    mockedOrg.update.mockResolvedValue({ values: body });

    const result = await routes.update({ body, req });

    expect(mockedOrg.update).toHaveBeenCalledWith(body);
    expect(result).toEqual({ status: 200, body: undefined });
  });
});

describe('delete', () => {
  it('returns 401 when the session is not a super admin', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);

    const result = await routes.delete({ body: { id: 1 }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedOrg.deleteById).not.toHaveBeenCalled();
  });

  it('deletes the org by id', async () => {
    mockedOrg.deleteById.mockResolvedValue(undefined);

    const result = await routes.delete({ body: { id: 1 }, req });

    expect(mockedOrg.deleteById).toHaveBeenCalledWith(1);
    expect(result).toEqual({ status: 200, body: undefined });
  });
});

describe('getByPath', () => {
  it('returns 401 when the user is neither an admin nor a super admin', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);
    mockedAdmin.isAdmin.mockResolvedValue(false);

    const result = await routes.getByPath({ params: { path: 'org1' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedOrg.getByPath).not.toHaveBeenCalled();
  });

  it('returns the org values for admins', async () => {
    const values = { id: 1, path: 'org1' };
    mockedOrg.getByPath.mockResolvedValue({ values });

    const result = await routes.getByPath({ params: { path: 'org1' }, req });

    expect(mockedOrg.getByPath).toHaveBeenCalledWith('org1');
    expect(result).toEqual({ status: 200, body: { org: values } });
  });
});

describe('getInfoForAdmin', () => {
  it('returns 401 when there is no session', async () => {
    mockedGetSession.mockResolvedValue(null);

    const result = await routes.getInfoForAdmin({ req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
  });

  it('maps each group to plain org and item values', async () => {
    const orgValues = { id: 1, path: 'org1' };
    const itemValues = { id: 10, name: 'A' };
    mockedOrg.getInfoFromAdminUserId.mockResolvedValue([
      { org: { values: orgValues }, items: [{ values: itemValues }, { values: { id: 11, name: 'B' } }] }
    ]);

    const result = await routes.getInfoForAdmin({ req });

    expect(mockedOrg.getInfoFromAdminUserId).toHaveBeenCalledWith('u1');
    expect(result).toEqual({
      status: 200,
      body: [{ org: orgValues, items: [itemValues, { id: 11, name: 'B' }] }]
    });
  });
});

describe('getAdminMembers', () => {
  it('returns 401 when the session is not a super admin', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);

    const result = await routes.getAdminMembers({ params: { orgPath: 'org1' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedAdminWithEmail.getMembersOfOrgByPath).not.toHaveBeenCalled();
  });

  it('returns each member without the row id and with the email', async () => {
    mockedAdminWithEmail.getMembersOfOrgByPath.mockResolvedValue([
      { values: { id: 1, userId: 'u2' }, email: 'u2@b.com' }
    ]);

    const result = await routes.getAdminMembers({ params: { orgPath: 'org1' }, req });

    expect(mockedAdminWithEmail.getMembersOfOrgByPath).toHaveBeenCalledWith('org1');
    expect(result).toEqual({ status: 200, body: [{ userId: 'u2', email: 'u2@b.com' }] });
  });
});

describe('addAdminMember', () => {
  it('returns 401 when the session is not a super admin', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);

    const result = await routes.addAdminMember({ params: { orgPath: 'org1' }, body: { email: 'u2@b.com' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
  });

  it('returns 404 when the user does not exist', async () => {
    mockedUser.getByEmail.mockResolvedValue(undefined);
    mockedAdmin.isAdminByEmail.mockResolvedValue(true);

    const result = await routes.addAdminMember({ params: { orgPath: 'org1' }, body: { email: 'missing@b.com' }, req });

    expect(result).toEqual({ status: 404, body: { message: 'User not found' } });
    expect(mockedOrgMember.createWithOrgPathAndEmail).not.toHaveBeenCalled();
  });

  it('returns 500 when the user is not an admin', async () => {
    mockedUser.getByEmail.mockResolvedValue({ values: { id: 'u2' } });
    mockedAdmin.isAdminByEmail.mockResolvedValue(false);

    const result = await routes.addAdminMember({ params: { orgPath: 'org1' }, body: { email: 'u2@b.com' }, req });

    expect(result).toEqual({ status: 500, body: { message: 'User to add is not an admin' } });
    expect(mockedOrgMember.createWithOrgPathAndEmail).not.toHaveBeenCalled();
  });

  it('adds the member and returns the user id', async () => {
    mockedUser.getByEmail.mockResolvedValue({ values: { id: 'u2' } });
    mockedAdmin.isAdminByEmail.mockResolvedValue(true);
    mockedOrgMember.createWithOrgPathAndEmail.mockResolvedValue({ values: { userId: 'u2' } });

    const result = await routes.addAdminMember({ params: { orgPath: 'org1' }, body: { email: 'u2@b.com' }, req });

    expect(mockedOrgMember.createWithOrgPathAndEmail).toHaveBeenCalledWith('org1', 'u2@b.com');
    expect(result).toEqual({ status: 200, body: { userId: 'u2' } });
  });
});

describe('removeAdminMember', () => {
  it('returns 401 when the session is not a super admin', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);

    const result = await routes.removeAdminMember({ params: { orgPath: 'org1' }, body: { userId: 'u2' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
  });

  it('returns 404 when the user does not exist', async () => {
    mockedUser.getById.mockResolvedValue(undefined);
    mockedAdmin.isAdmin.mockResolvedValue(true);

    const result = await routes.removeAdminMember({ params: { orgPath: 'org1' }, body: { userId: 'missing' }, req });

    expect(result).toEqual({ status: 404, body: { message: 'User not found' } });
    expect(mockedOrgMember.removeByIdFromOrgByPath).not.toHaveBeenCalled();
  });

  it('returns 500 when the user is not an admin', async () => {
    mockedUser.getById.mockResolvedValue({ values: { id: 'u2' } });
    mockedAdmin.isAdmin.mockResolvedValue(false);

    const result = await routes.removeAdminMember({ params: { orgPath: 'org1' }, body: { userId: 'u2' }, req });

    expect(result).toEqual({ status: 500, body: { message: 'Cannot remove member as admin, they are not admin' } });
    expect(mockedOrgMember.removeByIdFromOrgByPath).not.toHaveBeenCalled();
  });

  it('removes the member from the org', async () => {
    mockedUser.getById.mockResolvedValue({ values: { id: 'u2' } });
    mockedAdmin.isAdmin.mockResolvedValue(true);
    mockedOrgMember.removeByIdFromOrgByPath.mockResolvedValue(undefined);

    const result = await routes.removeAdminMember({ params: { orgPath: 'org1' }, body: { userId: 'u2' }, req });

    expect(mockedOrgMember.removeByIdFromOrgByPath).toHaveBeenCalledWith('org1', 'u2');
    expect(result).toEqual({ status: 200, body: undefined });
  });
});

describe('isValidNewAdminMember', () => {
  it('returns 401 when the session is not a super admin', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);

    const result = await routes.isValidNewAdminMember({ body: { email: 'u2@b.com', orgPath: 'org1' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
  });

  it('reports an invalid member when the user does not exist', async () => {
    mockedUser.getByEmail.mockResolvedValue(undefined);
    mockedAdmin.getByUserEmail.mockResolvedValue({ values: { userId: 'u2' } });

    const result = await routes.isValidNewAdminMember({ body: { email: 'missing@b.com', orgPath: 'org1' }, req });

    expect(result).toEqual({ status: 200, body: { valid: false, error: 'User does not exist' } });
  });

  it('reports an invalid member when the user is not an admin', async () => {
    mockedUser.getByEmail.mockResolvedValue({ values: { id: 'u2' } });
    mockedAdmin.getByUserEmail.mockResolvedValue(undefined);

    const result = await routes.isValidNewAdminMember({ body: { email: 'u2@b.com', orgPath: 'org1' }, req });

    expect(result).toEqual({ status: 200, body: { valid: false, error: 'User is not admin' } });
  });

  it('reports an invalid member when the user already belongs to the org', async () => {
    mockedUser.getByEmail.mockResolvedValue({ values: { id: 'u2' } });
    mockedAdmin.getByUserEmail.mockResolvedValue({ values: { userId: 'u2' } });
    mockedOrgMember.getBelongsToPaths.mockResolvedValue(['org1', 'other']);

    const result = await routes.isValidNewAdminMember({ body: { email: 'u2@b.com', orgPath: 'org1' }, req });

    expect(mockedOrgMember.getBelongsToPaths).toHaveBeenCalledWith('u2');
    expect(result).toEqual({ status: 200, body: { valid: false, error: 'User already belongs to org' } });
  });

  it('reports a valid member', async () => {
    mockedUser.getByEmail.mockResolvedValue({ values: { id: 'u2' } });
    mockedAdmin.getByUserEmail.mockResolvedValue({ values: { userId: 'u2' } });
    mockedOrgMember.getBelongsToPaths.mockResolvedValue(['other']);

    const result = await routes.isValidNewAdminMember({ body: { email: 'u2@b.com', orgPath: 'org1' }, req });

    expect(result).toEqual({ status: 200, body: { valid: true } });
  });
});

describe('addUserMember', () => {
  it('returns 401 when the user is neither an admin nor a super admin', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);
    mockedAdmin.isAdmin.mockResolvedValue(false);

    const result = await routes.addUserMember({ params: { orgPath: 'org1' }, body: { email: 'u2@b.com' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
  });

  it('returns 404 when the user does not exist', async () => {
    mockedUser.getByEmail.mockResolvedValue(undefined);
    mockedAdmin.isAdminByEmail.mockResolvedValue(false);
    mockedIsSuperAdmin.mockResolvedValue(false);

    const result = await routes.addUserMember({ params: { orgPath: 'org1' }, body: { email: 'missing@b.com' }, req });

    expect(result).toEqual({ status: 404, body: { message: 'User not found' } });
  });

  it('returns 500 when the user is an admin', async () => {
    mockedUser.getByEmail.mockResolvedValue({ values: { id: 'u2' } });
    mockedAdmin.isAdminByEmail.mockResolvedValue(true);
    mockedIsSuperAdmin.mockResolvedValue(false);

    const result = await routes.addUserMember({ params: { orgPath: 'org1' }, body: { email: 'u2@b.com' }, req });

    expect(result).toEqual({ status: 500, body: { message: 'Cannot add admin as user member' } });
    expect(mockedOrgMember.createWithOrgPathAndEmail).not.toHaveBeenCalled();
  });

  it('returns 500 when the user is a super admin', async () => {
    mockedUser.getByEmail.mockResolvedValue({ values: { id: 'u2' } });
    mockedAdmin.isAdminByEmail.mockResolvedValue(false);
    mockedIsSuperAdmin.mockResolvedValue(false);
    // isSuperAdminByEmail is a separate static on the mocked SuperAdmin.
    (SuperAdmin as unknown as { isSuperAdminByEmail: jest.Mock }).isSuperAdminByEmail.mockResolvedValue(true);

    const result = await routes.addUserMember({ params: { orgPath: 'org1' }, body: { email: 'u2@b.com' }, req });

    expect(result).toEqual({ status: 500, body: { message: 'Cannot add admin as user member' } });
  });

  it('adds the member and returns the user id', async () => {
    mockedUser.getByEmail.mockResolvedValue({ values: { id: 'u2' } });
    mockedAdmin.isAdminByEmail.mockResolvedValue(false);
    mockedIsSuperAdmin.mockResolvedValue(false);
    (SuperAdmin as unknown as { isSuperAdminByEmail: jest.Mock }).isSuperAdminByEmail.mockResolvedValue(false);
    mockedOrgMember.createWithOrgPathAndEmail.mockResolvedValue({ values: { userId: 'u2' } });

    const result = await routes.addUserMember({ params: { orgPath: 'org1' }, body: { email: 'u2@b.com' }, req });

    expect(mockedOrgMember.createWithOrgPathAndEmail).toHaveBeenCalledWith('org1', 'u2@b.com');
    expect(result).toEqual({ status: 200, body: { userId: 'u2' } });
  });
});

describe('removeUserMember', () => {
  it('returns 401 when the user is neither an admin nor a super admin', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);
    mockedAdmin.isAdmin.mockResolvedValue(false);

    const result = await routes.removeUserMember({ params: { orgPath: 'org1' }, body: { userId: 'u2' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
  });

  it('returns 404 when the user does not exist', async () => {
    // Admin.isAdmin is called for the session gate and again for the target user;
    // the second call must not be an admin for the 404 to be the meaningful branch.
    mockedUser.getById.mockResolvedValue(undefined);
    mockedAdmin.isAdmin.mockResolvedValueOnce(true).mockResolvedValue(false);

    const result = await routes.removeUserMember({ params: { orgPath: 'org1' }, body: { userId: 'missing' }, req });

    expect(result).toEqual({ status: 404, body: { message: 'User not found' } });
  });

  it('returns 500 when the user is an admin', async () => {
    mockedUser.getById.mockResolvedValue({ values: { id: 'u2' } });
    mockedAdmin.isAdmin.mockResolvedValueOnce(true).mockResolvedValue(true);
    mockedIsSuperAdmin.mockResolvedValue(false);

    const result = await routes.removeUserMember({ params: { orgPath: 'org1' }, body: { userId: 'u2' }, req });

    expect(result).toEqual({ status: 500, body: { message: 'Cannot remove admin as user member' } });
    expect(mockedOrgMember.removeByIdFromOrgByPath).not.toHaveBeenCalled();
  });

  it('removes the member from the org', async () => {
    mockedUser.getById.mockResolvedValue({ values: { id: 'u2' } });
    // Session gate passes (first call), target user is a plain member (second call).
    mockedAdmin.isAdmin.mockResolvedValueOnce(true).mockResolvedValue(false);
    mockedIsSuperAdmin.mockResolvedValue(false);
    mockedOrgMember.removeByIdFromOrgByPath.mockResolvedValue(undefined);

    const result = await routes.removeUserMember({ params: { orgPath: 'org1' }, body: { userId: 'u2' }, req });

    expect(mockedOrgMember.removeByIdFromOrgByPath).toHaveBeenCalledWith('org1', 'u2');
    expect(result).toEqual({ status: 200, body: undefined });
  });
});

describe('isValidNewUserMember', () => {
  it('returns 401 when the user is neither an admin nor a super admin', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);
    mockedAdmin.isAdmin.mockResolvedValue(false);

    const result = await routes.isValidNewUserMember({ body: { email: 'u2@b.com' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
  });

  it('reports an invalid member when the user does not exist', async () => {
    mockedUser.getByEmail.mockResolvedValue(undefined);
    mockedAdmin.isAdminByEmail.mockResolvedValue(false);
    mockedIsSuperAdmin.mockResolvedValue(false);

    const result = await routes.isValidNewUserMember({ body: { email: 'missing@b.com' }, req });

    expect(result).toEqual({ status: 200, body: { valid: false, error: 'User does not exist' } });
  });

  it('reports an invalid member when the user is an admin', async () => {
    mockedUser.getByEmail.mockResolvedValue({ values: { id: 'u2' } });
    mockedAdmin.isAdminByEmail.mockResolvedValue(true);
    mockedIsSuperAdmin.mockResolvedValue(false);

    const result = await routes.isValidNewUserMember({ body: { email: 'u2@b.com' }, req });

    expect(result).toEqual({ status: 200, body: { valid: false, error: 'User is an admin' } });
  });

  it('reports a valid member', async () => {
    mockedUser.getByEmail.mockResolvedValue({ values: { id: 'u2' } });
    mockedAdmin.isAdminByEmail.mockResolvedValue(false);
    mockedIsSuperAdmin.mockResolvedValue(false);
    (SuperAdmin as unknown as { isSuperAdminByEmail: jest.Mock }).isSuperAdminByEmail.mockResolvedValue(false);

    const result = await routes.isValidNewUserMember({ body: { email: 'u2@b.com' }, req });

    expect(result).toEqual({ status: 200, body: { valid: true } });
  });
});

describe('getUserMembers', () => {
  it('returns 401 when the user is neither an admin nor a super admin', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);
    mockedAdmin.isAdmin.mockResolvedValue(false);

    const result = await routes.getUserMembers({ params: { orgPath: 'org1' }, req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedUser.getMembersOfOrgByPath).not.toHaveBeenCalled();
  });

  it('returns each member as a userId and email pair', async () => {
    mockedUser.getMembersOfOrgByPath.mockResolvedValue([
      { values: { id: 'u2', email: 'u2@b.com' } },
      { values: { id: 'u3', email: 'u3@b.com' } }
    ]);

    const result = await routes.getUserMembers({ params: { orgPath: 'org1' }, req });

    expect(mockedUser.getMembersOfOrgByPath).toHaveBeenCalledWith('org1');
    expect(result).toEqual({
      status: 200,
      body: [
        { userId: 'u2', email: 'u2@b.com' },
        { userId: 'u3', email: 'u3@b.com' }
      ]
    });
  });
});

describe('getOrgsForAdmin', () => {
  it('returns 401 when the user is neither an admin nor a super admin', async () => {
    mockedIsSuperAdmin.mockResolvedValue(false);
    mockedAdmin.isAdmin.mockResolvedValue(false);

    const result = await routes.getOrgsForAdmin({ req });

    expect(result).toEqual({ status: 401, body: { message: '401 unauthorized' } });
    expect(mockedOrg.getOrgsForAdminUserId).not.toHaveBeenCalled();
  });

  it('returns the org values for the session user', async () => {
    mockedOrg.getOrgsForAdminUserId.mockResolvedValue([
      { values: { id: 1, path: 'org1' } },
      { values: { id: 2, path: 'org2' } }
    ]);

    const result = await routes.getOrgsForAdmin({ req });

    expect(mockedOrg.getOrgsForAdminUserId).toHaveBeenCalledWith('u1');
    expect(result).toEqual({ status: 200, body: [{ id: 1, path: 'org1' }, { id: 2, path: 'org2' }] });
  });
});
