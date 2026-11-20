import {
  adminTable,
  orgMemberTable,
  orgTable,
  superAdminTable,
  user
} from '@invm/inventory-db-utils';
import type { User as UserType } from '../../types/types';
import { db } from '../db';
import { and, eq, isNull } from 'drizzle-orm';

export class User {
  values: UserType;

  constructor(values: UserType) {
    this.values = values;
  }

  static async getById(userId: string) {
    const [res] = await db.select().from(user).where(eq(user.id, userId));
    if (res === undefined) return undefined;
    return new User(res);
  }

  static async getByEmail(email: string) {
    const [res] = await db.select().from(user).where(eq(user.email, email));
    if (res === undefined) return undefined;
    return new User(res!);
  }

  static async getMembersOfOrgByPath(orgPath: string) {
    const res = await db
      .select({ user: user })
      .from(user)
      .innerJoin(orgTable, eq(orgTable.path, orgPath))
      .innerJoin(orgMemberTable, eq(orgMemberTable.orgId, orgTable.id))
      .leftJoin(adminTable, eq(adminTable.userId, user.id))
      .leftJoin(superAdminTable, eq(superAdminTable.userId, user.id))
      .where(
        and(eq(orgTable.path, orgPath), isNull(adminTable.userId), isNull(superAdminTable.userId))
      );

    return res.map((user) => new User(user.user));
  }
}
