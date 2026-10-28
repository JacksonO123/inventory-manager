import { itemTable } from '@invm/inventory-db-utils';
import { partialItemSchema } from '@invm/api-contracts/schemas';
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
    const parsed = partialItemSchema.parse(values);
    const [createdItem] = await db.insert(itemTable).values(parsed).returning();
    if (createdItem === undefined) {
      throw new Error('Failed to create item');
    }
    return new Item(createdItem);
  }
}
