import { basicUserTable, checkoutTable, itemTable } from '@invm/inventory-db-utils';
import { partialItemSchema } from '@invm/api-contracts/schemas';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../db';
import { PartialItem, Item as ItemType } from '../../types/types';

export type CheckoutResult =
  | { ok: true; item: Item }
  | { ok: false; reason: 'item_not_found' | 'borrower_not_found' | 'not_available' };

export type ReturnResult =
  | { ok: true; item: Item }
  | { ok: false; reason: 'item_not_found' | 'not_checked_out' };

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

  static async checkOut(itemId: number, borrowerId: number): Promise<CheckoutResult> {
    return await db.transaction(async (tx) => {
      const [borrower] = await tx
        .select({ id: basicUserTable.id })
        .from(basicUserTable)
        .where(eq(basicUserTable.id, borrowerId))
        .limit(1);
      if (borrower === undefined) {
        return { ok: false, reason: 'borrower_not_found' };
      }

      // only flips the status if the item is still available, so two people
      // checking out the same item at once can't both succeed
      const [item] = await tx
        .update(itemTable)
        .set({ status: 'booked' })
        .where(and(eq(itemTable.id, itemId), eq(itemTable.status, 'available')))
        .returning();
      if (item === undefined) {
        const exists = await Item.exists(tx, itemId);
        return { ok: false, reason: exists ? 'not_available' : 'item_not_found' };
      }

      await tx.insert(checkoutTable).values({ itemId, borrowerId });
      return { ok: true, item: new Item(item) };
    });
  }

  static async return(itemId: number, borrowerId: number): Promise<ReturnResult> {
    return await db.transaction(async (tx) => {
      const [checkout] = await tx
        .update(checkoutTable)
        .set({ returnedAt: new Date() })
        .where(
          and(
            eq(checkoutTable.itemId, itemId),
            eq(checkoutTable.borrowerId, borrowerId),
            isNull(checkoutTable.returnedAt)
          )
        )
        .returning({ id: checkoutTable.id });
      if (checkout === undefined) {
        const exists = await Item.exists(tx, itemId);
        return { ok: false, reason: exists ? 'not_checked_out' : 'item_not_found' };
      }

      const [item] = await tx
        .update(itemTable)
        .set({ status: 'available' })
        .where(eq(itemTable.id, itemId))
        .returning();
      if (item === undefined) {
        throw new Error('Failed to update item status');
      }
      return { ok: true, item: new Item(item) };
    });
  }

  private static async exists(tx: Pick<typeof db, 'select'>, itemId: number) {
    const [row] = await tx
      .select({ id: itemTable.id })
      .from(itemTable)
      .where(eq(itemTable.id, itemId))
      .limit(1);
    return row !== undefined;
  }
}
