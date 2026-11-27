import { itemTable, orgItemTable, orgTable } from '@invm/inventory-db-utils';
import { partialItemSchema } from '@invm/api-contracts/schemas';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { HttpError } from '../errors';
import { PartialItem, Item as ItemType } from '../../types/types';

export class Item {
  values: ItemType;

  constructor(values: ItemType) {
    this.values = values;
  }

  static async create(values: PartialItem, orgId: number) {
    const parsed = partialItemSchema.parse(values);
    const createdItem = await db.transaction(async (tx) => {
      const [createdItem] = await tx.insert(itemTable).values(parsed).returning();
      await tx.insert(orgItemTable).values({ itemId: createdItem!.id, orgId: orgId });
      return createdItem!;
    });

    return new Item(createdItem);
  }

  static async getByIdAndOrgPath(itemId: number, orgPath: string) {
    const [item] = await db
      .select({
        id: itemTable.id,
        name: itemTable.name,
        description: itemTable.description,
        status: itemTable.status
      })
      .from(itemTable)
      .innerJoin(orgItemTable, eq(orgItemTable.itemId, itemTable.id))
      .innerJoin(orgTable, and(eq(orgTable.id, orgItemTable.orgId), eq(orgTable.path, orgPath)))
      .where(eq(itemTable.id, itemId));
    if (item === undefined) {
      throw new HttpError(404, 'Item not found');
    }

    return new Item(item);
  }

  static async getAllGroupByOrgs() {
    return await db
      .select({
        orgId: orgItemTable.orgId,
        items: sql<ItemType[]>`coalesce(json_agg(${itemTable}.*), '[]'::json)`
      })
      .from(itemTable)
      .innerJoin(orgItemTable, eq(orgItemTable.itemId, itemTable.id))
      .groupBy(orgItemTable.orgId);
  }
}
