import { itemTable, orgItemTable, orgMemberTable, orgTable } from '@invm/inventory-db-utils';
import { Org as OrgType, PartialOrg, Item as ItemType } from '../../types/types';
import { db } from '../db';
import { and, eq, sql } from 'drizzle-orm';
import { HttpError } from '../errors';
import { Item } from './Item';

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
      const [table] = await tx.insert(orgTable).values(partialOrg).returning();
      return new Org(table!);
    });
  }

  static async update(org: OrgType) {
    const { id, ...rest } = org;
    const [res] = await db.update(orgTable).set(rest).where(eq(orgTable.id, id)).returning();
    return new Org(res!);
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

  static async getByPath(path: string) {
    const [org] = await db.select().from(orgTable).where(eq(orgTable.path, path));
    if (org === undefined) {
      throw new HttpError(404, 'Org not found');
    }

    return new Org(org);
  }

  static async getInfoFromAdminUserId(userId: string) {
    const res = await db
      .select({
        org: orgTable,
        items: sql<
          ItemType[]
        >`coalesce(json_agg(${itemTable}.*) filter (where ${itemTable.id} is not null), '[]'::json)`
      })
      .from(orgTable)
      .leftJoin(orgItemTable, eq(orgItemTable.orgId, orgTable.id))
      .leftJoin(itemTable, eq(itemTable.id, orgItemTable.itemId))
      .innerJoin(
        orgMemberTable,
        and(eq(orgMemberTable.orgId, orgTable.id), eq(orgMemberTable.userId, userId))
      )
      .groupBy(
        orgTable.id,
        orgTable.name,
        orgTable.description,
        orgTable.svgDataUrl,
        orgTable.path
      );

    return res.map(({ org, items }) => ({
      org: new Org(org),
      items: items.map((item) => new Item(item))
    }));
  }

  static async getOrgsForAdminUserId(userId: string) {
    const res = await db
      .select({ org: orgTable })
      .from(orgTable)
      .innerJoin(
        orgMemberTable,
        and(eq(orgMemberTable.orgId, orgTable.id), eq(orgMemberTable.userId, userId))
      );

    return res.map((row) => new Org(row.org));
  }
}
