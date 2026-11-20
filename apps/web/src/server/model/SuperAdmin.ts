import { superAdminTable, user } from '@invm/inventory-db-utils';
import { AdminAndEmail, Admin as AdminType } from '../../types/types';
import { db } from '../db';
import { and, eq } from 'drizzle-orm';

export class SuperAdmin {
  values: AdminType;

  constructor(values: AdminType) {
    this.values = values;
  }

  static async create(userId: string) {
    const [res] = await db.insert(superAdminTable).values({ userId: userId }).returning();
    return new SuperAdmin(res!);
  }

  static async isSuperAdmin(userId: string) {
    const [admin] = await db
      .select({ id: superAdminTable.id })
      .from(superAdminTable)
      .where(eq(superAdminTable.userId, userId));
    return admin !== undefined;
  }

  static async isSuperAdminByEmail(email: string) {
    const [admin] = await db
      .select({ id: superAdminTable.id })
      .from(superAdminTable)
      .innerJoin(user, and(eq(user.id, superAdminTable.userId), eq(user.email, email)));
    return admin !== undefined;
  }

  static async revoke(userId: string) {
    await db.delete(superAdminTable).where(eq(superAdminTable.userId, userId));
  }

  static async getByUserId(userId: string) {
    const [res] = await db.select().from(superAdminTable).where(eq(superAdminTable.userId, userId));
    return res;
  }
}

export class SuperAdminWithEmail extends SuperAdmin {
  email: string;

  constructor(values: AdminAndEmail) {
    super({ id: values.id, userId: values.userId });
    this.email = values.email;
  }

  static async getAll() {
    const res = await db
      .select({ id: superAdminTable.id, userId: superAdminTable.userId, email: user.email })
      .from(superAdminTable)
      .innerJoin(user, eq(superAdminTable.userId, user.id));
    return res.map((item) => new SuperAdminWithEmail(item));
  }
}
