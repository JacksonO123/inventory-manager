import { adminTable, user } from '@invm/inventory-db-utils';
import type { Admin as AdminType } from '../../types/types';
import { db } from '../db';
import { eq } from 'drizzle-orm';

export class Admin {
  values: AdminType;

  constructor(values: AdminType) {
    this.values = values;
  }

  static async create(userId: string) {
    const [res] = await db.insert(adminTable).values({ user_id: userId }).returning();
    if (res === undefined) {
      throw new Error('Failed to create new admin');
    }
    return new Admin(res);
  }

  static async isAdmin(userId: string) {
    const [admin] = await db
      .select({ id: adminTable.id })
      .from(adminTable)
      .where(eq(adminTable.user_id, userId));
    return admin !== undefined;
  }

  static async revoke(id: number) {
    await db.delete(adminTable).where(eq(adminTable.id, id));
  }

  static async getById(id: number) {
    const [res] = await db.select().from(adminTable).where(eq(adminTable.id, id));
    return res;
  }
}

export class AdminWithEmail extends Admin {
  email: string;

  constructor(values: AdminType & { email: string }) {
    super({ id: values.id, user_id: values.user_id });
    this.email = values.email;
  }

  static async getAll() {
    const res = await db
      .select({ id: adminTable.id, user_id: adminTable.user_id, email: user.email })
      .from(adminTable)
      .innerJoin(user, eq(adminTable.user_id, user.id));
    return res.map((item) => new AdminWithEmail(item));
  }
}
