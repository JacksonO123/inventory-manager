import { superAdminTable } from '@invm/inventory-db-utils';
import { SuperAdmin as SuperAdminType } from '../../types/types';
import { db } from '../db';
import { eq } from 'drizzle-orm';

export class SuperAdmin {
  values: SuperAdminType;

  constructor(values: SuperAdminType) {
    this.values = values;
  }

  static async isSuperAdmin(userId: string) {
    const [admin] = await db
      .select({ id: superAdminTable.id })
      .from(superAdminTable)
      .where(eq(superAdminTable.user_id, userId));
    return admin !== undefined;
  }
}
