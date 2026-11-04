import { basicUserTable, checkoutTable, itemTable } from '@invm/inventory-db-utils';
import { partialItemSchema } from '@invm/api-contracts/schemas';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../db';
import { HttpError } from '../errors';
import { PartialItem, Item as ItemType } from '../../types/types';

export class Item {
  values: ItemType;

  constructor(values: ItemType) {
    this.values = values;
  }

  static async getAll() {
    return await db
      .select({
        id: itemTable.id,
        name: itemTable.name,
        description: itemTable.description,
        status: itemTable.status,
        borrower: checkoutTable.borrowerId
      })
      .from(itemTable)
      .leftJoin(
        checkoutTable,
        and(eq(checkoutTable.itemId, itemTable.id), isNull(checkoutTable.returnedAt))
      );
  }

  static async create(values: PartialItem) {
    const parsed = partialItemSchema.parse(values);
    const [createdItem] = await db.insert(itemTable).values(parsed).returning();
    if (createdItem === undefined) {
      throw new Error('Failed to create item');
    }
    return new Item(createdItem);
  }

  static async checkOut(itemId: number, borrowerId: number) {
    await db.transaction(async (tx) => {
      const [borrower] = await tx
        .select({ id: basicUserTable.id })
        .from(basicUserTable)
        .where(eq(basicUserTable.id, borrowerId))
        .limit(1);
      if (borrower === undefined) {
        throw new HttpError(404, 'Borrower not found');
      }

      // only flips the status if the item is still available, so two people
      // checking out the same item at once can't both succeed
      const [item] = await tx
        .update(itemTable)
        .set({ status: 'booked' })
        .where(and(eq(itemTable.id, itemId), eq(itemTable.status, 'available')))
        .returning({ id: itemTable.id });
      if (item === undefined) {
        if (await Item.exists(itemId, tx)) {
          throw new HttpError(409, 'Item is not available');
        }
        throw new HttpError(404, 'Item not found');
      }

      await tx.insert(checkoutTable).values({ itemId, borrowerId });
    });
  }

  static async return(itemId: number) {
    await db.transaction(async (tx) => {
      const [checkout] = await tx
        .update(checkoutTable)
        .set({ returnedAt: new Date() })
        .where(and(eq(checkoutTable.itemId, itemId), isNull(checkoutTable.returnedAt)))
        .returning({ id: checkoutTable.id });
      if (checkout === undefined) {
        throw new HttpError(404, 'Item not found');
      }

      await tx.update(itemTable).set({ status: 'available' }).where(eq(itemTable.id, itemId));
    });
  }

  static async exists(itemId: number, tx: Pick<typeof db, 'select'> = db) {
    const [row] = await tx
      .select({ id: itemTable.id })
      .from(itemTable)
      .where(eq(itemTable.id, itemId))
      .limit(1);
    return row !== undefined;
  }
}
