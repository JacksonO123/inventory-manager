import { itemTable } from '@invm/inventory-db-utils';
import { itemSchema } from '@invm/api-contracts/schemas';
import { db } from '../db';
import { PartialItem, Item as ItemType } from '../../types/types';

const createItemSchema = itemSchema.omit({ id: true });

export class Item {
  values: ItemType;

  constructor(values: ItemType) {
    this.values = values;
  }

  static async getAll() {
    return await db.select().from(itemTable);
  }

  static async create(values: PartialItem) {
    const parsed = createItemSchema.parse(values);
    const [createdItem] = await db.insert(itemTable).values(parsed).returning();
    return new Item(createdItem);
  }
}
