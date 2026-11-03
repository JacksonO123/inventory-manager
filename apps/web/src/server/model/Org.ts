import { orgTable } from '@invm/inventory-db-utils';
import { Org as OrgType, PartialOrg } from '../../types/types';
import { db } from '../db';
import { count } from 'drizzle-orm';

export class Org {
  values: OrgType;

  constructor(values: OrgType) {
    this.values = values;
  }

  static async getAll() {
    const orgs = await db.select().from(orgTable);
    return orgs;
  }

  static async create(partialOrg: PartialOrg) {
    return await db.transaction(async (tx) => {
      const [orgCount] = await tx.select({ count: count() }).from(orgTable);
      if (orgCount === undefined) {
        throw new Error('Failed to count orgs');
      }

      const [table] = await db
        .insert(orgTable)
        .values({ ...partialOrg, location: orgCount.count })
        .returning();
      if (table === undefined) {
        throw new Error('Failed to create org');
      }

      return new Org(table);
    });
  }
}
