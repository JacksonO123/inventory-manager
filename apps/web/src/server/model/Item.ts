import { itemTable } from '@invm/inventory-db-utils';
import { itemSchemaOmitId } from '@invm/api-contracts/schemas';
import { db } from '../db';
import { PartialItem, Item as ItemType } from '../../types/types';

export class Item {
  values: ItemType;

  constructor(values: ItemType) {
    this.values = values;
  }

  static async getAll() {
    return await db.select().from(itemTable);
  }

  static async create(values: PartialItem) {
    const parsed = itemSchemaOmitId.parse(values);
    const [createdItem] = await db.insert(itemTable).values(parsed).returning();
    return new Item(createdItem);
  }
}
