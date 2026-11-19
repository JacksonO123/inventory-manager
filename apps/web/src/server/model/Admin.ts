import { adminTable, orgMemberTable, orgTable, user } from '@invm/inventory-db-utils';
import type { Admin as AdminType } from '../../types/types';
import { db } from '../db';
import { and, eq } from 'drizzle-orm';

export class Admin {
  values: AdminType;

  constructor(values: AdminType) {
    this.values = values;
  }

  static async create(userId: string) {
    const [res] = await db.insert(adminTable).values({ userId: userId }).returning();
    return new Admin(res!);
  }

  static async isAdmin(userId: string) {
    const [admin] = await db
      .select({ id: adminTable.id })
      .from(adminTable)
      .where(eq(adminTable.userId, userId));
    return admin !== undefined;
  }

  static async revoke(userId: string) {
    await db.delete(adminTable).where(eq(adminTable.userId, userId));
  }

  static async getByUserId(userId: string) {
    const [res] = await db.select().from(adminTable).where(eq(adminTable.userId, userId));
    return res;
  }

  static async isAdminByEmail(email: string) {
    const [res] = await db
      .select({
        id: adminTable.userId
      })
      .from(adminTable)
      .innerJoin(user, and(eq(user.id, adminTable.userId), eq(user.email, email)));
    return res;
  }
}

export class AdminWithEmail extends Admin {
  email: string;

  constructor(values: AdminType & { email: string }) {
    super({ id: values.id, userId: values.userId });
    this.email = values.email;
  }

  static async getAll() {
    const res = await db
      .select({ id: adminTable.id, userId: adminTable.userId, email: user.email })
      .from(adminTable)
      .innerJoin(user, eq(adminTable.userId, user.id));
    return res.map((item) => new AdminWithEmail(item));
  }

  static async getMembersOfOrgByPath(orgPath: string) {
    const res = await db
      .select({ id: adminTable.id, userId: orgMemberTable.userId, email: user.email })
      .from(orgTable)
      .innerJoin(orgMemberTable, eq(orgMemberTable.orgId, orgTable.id))
      .innerJoin(user, eq(user.id, orgMemberTable.userId))
      .innerJoin(adminTable, eq(adminTable.userId, user.id))
      .where(eq(orgTable.path, orgPath));

    return res.map((member) => new AdminWithEmail(member));
  }
}
