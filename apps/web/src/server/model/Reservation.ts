import { reservationTable, orgItemTable, orgTable } from '@invm/inventory-db-utils';
import { Reservation as EventType, PartialReservation } from '../../types/types';
import { db } from '../db';
import { z } from 'zod';
import { eventStatusEnum } from '@invm/api-contracts/schemas';
import { and, eq } from 'drizzle-orm';

export class Reservation {
  values: EventType;

  constructor(values: EventType) {
    this.values = values;
  }

  static async create(
    partialEvent: PartialReservation,
    borrowerId: string,
    status: z.infer<typeof eventStatusEnum>
  ) {
    const [res] = await db
      .insert(reservationTable)
      .values({
        status: status,
        borrower: borrowerId,
        ...partialEvent
      })
      .returning();

    const { id, ...others } = res!;
    const newEvent = { ...others, id: id + '' };
    return new Reservation(newEvent);
  }

  static async getByItemIdAndOrgPath(itemId: number, orgPath: string) {
    const res = await db
      .select({
        reservation: reservationTable
      })
      .from(reservationTable)
      .leftJoin(orgTable, eq(orgTable.path, orgPath))
      .innerJoin(
        orgItemTable,
        and(eq(orgItemTable.orgId, orgTable.id), eq(orgItemTable.itemId, itemId))
      );

    return res.map(
      ({ reservation: { id, ...event } }) => new Reservation({ id: id + '', ...event })
    );
  }
}
