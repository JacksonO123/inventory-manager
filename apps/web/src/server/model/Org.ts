import { orgTable } from '@invm/inventory-db-utils';
import { Org as OrgType, PartialOrg } from '../../types/types';
import { db } from '../db';
import { count, eq } from 'drizzle-orm';

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

      const [table] = await db.insert(orgTable).values(partialOrg).returning();
      if (table === undefined) {
        throw new Error('Failed to create org');
      }

      return new Org(table);
    });
  }

  static async update(org: OrgType) {
    const [res] = await db.update(orgTable).set(org).returning();
    if (res === undefined) {
      throw new Error('Failed to update org');
    }
    return new Org(res);
  }

  static async deleteById(id: number) {
    const [org] = await db
      .delete(orgTable)
      .where(eq(orgTable.id, id))
      .returning({ id: orgTable.id });
    if (org === undefined) {
      throw new Error('Failed to delete org');
    }
  }
}
