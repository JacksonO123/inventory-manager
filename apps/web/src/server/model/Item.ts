import {
  checkoutTable,
  itemTable,
  orgItemTable,
  orgTable,
  reservationTable,
  user
} from '@invm/inventory-db-utils';
import { partialItemSchema } from '@invm/api-contracts/schemas';
import { and, eq, gt, isNull, lt, sql } from 'drizzle-orm';
import { db } from '../db';
import { HttpError } from '../errors';
import { PartialItem, Item as ItemType, ReservationWithBorrowerName } from '../../types/types';

export class Item {
  values: ItemType;

  constructor(values: ItemType) {
    this.values = values;
  }

  static async getAllFromOrgPath(orgPath: string) {
    const res = await db
      .select({
        item: itemTable
      })
      .from(itemTable)
      .innerJoin(orgItemTable, eq(orgItemTable.itemId, itemTable.id))
      .innerJoin(orgTable, and(eq(orgTable.id, orgItemTable.orgId), eq(orgTable.path, orgPath)));

    return res.map((entry) => new Item(entry.item));
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

  static async checkOut(itemId: number, borrowerId: string) {
    await db.transaction(async (tx) => {
      const [borrower] = await tx
        .select({ id: user.id })
        .from(user)
        .where(eq(user.id, borrowerId))
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

  static async getAllFromOrgPathWithReservationsBetweenDates(
    orgPath: string,
    start: Date,
    end: Date
  ) {
    const res = await db
      .select({
        item: itemTable,
        reservations: sql<
          ReservationWithBorrowerName[]
        >`coalesce(json_agg(to_jsonb(${reservationTable}) || jsonb_build_object('borrowerName', ${user.name})) filter (where ${reservationTable.id} is not null), '[]'::json)`
      })
      .from(orgTable)
      .innerJoin(orgItemTable, eq(orgItemTable.orgId, orgTable.id))
      .innerJoin(itemTable, eq(itemTable.id, orgItemTable.itemId))
      .leftJoin(
        reservationTable,
        and(
          eq(reservationTable.itemId, itemTable.id),
          eq(reservationTable.orgId, orgTable.id),
          lt(reservationTable.start, end),
          gt(reservationTable.end, start)
        )
      )
      .leftJoin(user, eq(reservationTable.borrower, user.id))
      .where(eq(orgTable.path, orgPath))
      .groupBy(itemTable.id);

    return res;
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
