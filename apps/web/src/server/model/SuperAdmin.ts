import { superAdminTable, user } from '@invm/inventory-db-utils';
import { AdminAndEmail, Admin as AdminType } from '../../types/types';
import { db } from '../db';
import { eq } from 'drizzle-orm';

export class SuperAdmin {
  values: AdminType;

  constructor(values: AdminType) {
    this.values = values;
  }

  static async create(userId: string) {
    const [res] = await db.insert(superAdminTable).values({ user_id: userId }).returning();
    if (res === undefined) {
      throw new Error('Failed to create super admin');
    }
    return new SuperAdmin(res);
  }

  static async isSuperAdmin(userId: string) {
    const [admin] = await db
      .select({ id: superAdminTable.id })
      .from(superAdminTable)
      .where(eq(superAdminTable.user_id, userId));
    return admin !== undefined;
  }

  static async revoke(id: number) {
    await db.delete(superAdminTable).where(eq(superAdminTable.id, id));
  }

  static async getById(id: number) {
    const [res] = await db.select().from(superAdminTable).where(eq(superAdminTable.id, id));
    return res;
  }
}

export class SuperAdminWithEmail extends SuperAdmin {
  email: string;

  constructor(values: AdminAndEmail) {
    super({ id: values.id, user_id: values.user_id });
    this.email = values.email;
  }

  static async getAll() {
    const res = await db
      .select({ id: superAdminTable.id, user_id: superAdminTable.user_id, email: user.email })
      .from(superAdminTable)
      .innerJoin(user, eq(superAdminTable.user_id, user.id));
    return res.map((item) => new SuperAdminWithEmail(item));
  }
}
