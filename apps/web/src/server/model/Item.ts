import { basicUserTable, checkoutTable, itemTable } from '@invm/inventory-db-utils';
import { itemSchema, partialItemSchema } from '@invm/api-contracts/schemas';
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
        is_available: itemTable.is_available,
        is_lent_out: itemTable.is_lent_out,
        is_damaged: itemTable.is_damaged,
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
        .set({ is_available: false, is_lent_out: true })
        .where(
          and(
            eq(itemTable.id, itemId),
            eq(itemTable.is_available, true),
            eq(itemTable.is_lent_out, false)
          )
        )
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

      await tx
        .update(itemTable)
        .set({ is_available: true, is_lent_out: false })
        .where(eq(itemTable.id, itemId));
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

  static async edit(itemId: number, values: Partial<Omit<ItemType, 'id'>>) {
    const parsed = itemSchema.omit({ id: true }).partial().parse(values);
    if (Object.keys(parsed).length === 0) throw new HttpError(400, 'No valid edits provided');
    const [updated] = await db
      .update(itemTable)
      .set(parsed)
      .where(eq(itemTable.id, itemId))
      .returning({ id: itemTable.id });
    if (!updated) throw new HttpError(404, 'Item not found');
  }

  static async delete(itemId: number) {
    if (!(await Item.exists(itemId))) {
      throw new HttpError(404, 'Item not found');
    }

    const [deleted] = await db
      .delete(itemTable)
      .where(and(eq(itemTable.id, itemId), eq(itemTable.is_lent_out, false)))
      .returning({ id: itemTable.id });

    if (!deleted) {
      throw new HttpError(409, 'Item is currently lent out');
    }
  }
}
