import { itemTable } from '@invm/inventory-db-utils';
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
    const [createdItem] = await db.insert(itemTable).values(values).returning();
    return new Item(createdItem);
  }
}
