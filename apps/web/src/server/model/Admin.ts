import { adminTable } from '@invm/inventory-db-utils';
import type { Admin as AdminType } from '../../types/types';
import { db } from '../db';
import { eq } from 'drizzle-orm';

export class Admin {
  values: AdminType;

  constructor(values: AdminType) {
    this.values = values;
  }

  static async isAdmin(userId: string) {
    const [admin] = await db
      .select({ id: adminTable.id })
      .from(adminTable)
      .where(eq(adminTable.user_id, userId));
    return admin !== undefined;
  }
}
