/**
 * @jest-environment node
 */
import { OrgMember } from './OrgMember';
import { fakeDb } from './fake-db';
import { orgMemberTable } from '@invm/inventory-db-utils';

jest.mock('../db', () => ({ db: require('./fake-db').fakeDb.db }));

const memberRow = { id: 1, userId: 'u1', orgId: 5 };

afterEach(() => {
  jest.clearAllMocks();
  fakeDb.clear();
});

describe('OrgMember.createWithOrgPathAndEmail', () => {
  it('resolves the user/org from the lookup and returns the inserted member', async () => {
    fakeDb.queue([{ userId: 'u1', orgId: 5 }], [memberRow]);

    const member = await OrgMember.createWithOrgPathAndEmail('org1', 'a@b.com');

    expect(member).toBeInstanceOf(OrgMember);
    expect(member.values).toEqual(memberRow);
  });
});

describe('OrgMember.removeByIdFromOrgByPath', () => {
  it('deletes the member row for the org', async () => {
    fakeDb.queue([{ orgId: 5 }], []);
    await OrgMember.removeByIdFromOrgByPath('org1', 'u1');

    expect(fakeDb.db.delete).toHaveBeenCalledWith(orgMemberTable);
    expect(fakeDb.render(fakeDb.lastWhere)).toEqual({
      sql: '("org_member"."user_id" = $1 and "org_member"."org_id" = $2)',
      params: ['u1', 5]
    });
  });

  it('throws a 404 when the org does not exist', async () => {
    fakeDb.queue([]);
    await expect(OrgMember.removeByIdFromOrgByPath('missing', 'u1')).rejects.toMatchObject({
      status: 404
    });
  });
});

describe('OrgMember.getBelongsToPaths', () => {
  it('returns the org paths the user belongs to', async () => {
    fakeDb.queue([{ path: 'org1' }, { path: 'org2' }]);

    await expect(OrgMember.getBelongsToPaths('u1')).resolves.toEqual(['org1', 'org2']);
  });

  it('returns an empty array when the user belongs to no orgs', async () => {
    fakeDb.queue([]);
    await expect(OrgMember.getBelongsToPaths('u1')).resolves.toEqual([]);
  });
});
