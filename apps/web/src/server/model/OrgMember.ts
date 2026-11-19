import { orgMemberTable, orgTable, user } from '@invm/inventory-db-utils';
import { and, eq } from 'drizzle-orm';
import { OrgMember as OrgMemberType } from '../../types/types';
import { db } from '../db';

export class OrgMember {
  values: OrgMemberType;

  constructor(values: OrgMemberType) {
    this.values = values;
  }

  static async getByOrgPath(orgPath: string, email: string) {
    const userInfo = await db
      .select({ userId: user.id, orgId: orgTable.id })
      .from(user)
      .innerJoin(orgTable, and(eq(orgTable.path, orgPath), eq(user.email, email)));

    const [res] = await db.insert(orgMemberTable).values(userInfo).returning();

    return new OrgMember(res!);
  }

  static async removeByIdFromOrgByPath(orgPath: string, userId: string) {
    const [orgIdRes] = await db
      .select({ orgId: orgTable.id })
      .from(orgTable)
      .where(eq(orgTable.path, orgPath));

    await db
      .delete(orgMemberTable)
      .where(and(eq(orgMemberTable.userId, userId), eq(orgMemberTable.orgId, orgIdRes!.orgId)));
  }

  static async getBelongsToPaths(userId: string) {
    const res = await db
      .select({ path: orgTable.path })
      .from(orgMemberTable)
      .innerJoin(orgTable, eq(orgTable.id, orgMemberTable.orgId))
      .where(eq(orgMemberTable.userId, userId));
    return res.map((entry) => entry.path);
  }
}
