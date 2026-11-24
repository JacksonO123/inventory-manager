import { reservationTable, orgItemTable, orgTable, user } from '@invm/inventory-db-utils';
import {
  Reservation as EventType,
  PartialReservation,
  ReservationWithBorrowerName
} from '../../types/types';
import { db } from '../db';
import { z } from 'zod';
import { reservationStatusEnum } from '@invm/api-contracts/schemas';
import { and, eq, gte, lte, or, sql } from 'drizzle-orm';

export class Reservation {
  values: EventType;

  constructor(values: EventType) {
    this.values = values;
  }

  /// null return means reservation conflicts with existing reservations
  static async create(
    partialReservation: PartialReservation,
    borrowerId: string,
    status: z.infer<typeof reservationStatusEnum>
  ) {
    const conflicts = await db
      .select({ id: reservationTable.id })
      .from(reservationTable)
      .where(
        or(
          and(
            lte(reservationTable.start, partialReservation.start),
            gte(reservationTable.end, partialReservation.start)
          ),
          and(
            lte(reservationTable.start, partialReservation.end),
            gte(reservationTable.end, partialReservation.end)
          ),
          and(
            gte(reservationTable.start, partialReservation.start),
            lte(reservationTable.end, partialReservation.end)
          )
        )
      );

    if (conflicts.length > 0) {
      // returning null meaning aborted due to time conflict
      return null;
    }

    const [res] = await db
      .insert(reservationTable)
      .values({
        status: status,
        borrower: borrowerId,
        ...partialReservation
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

  static async getByOrgIdBetweenDates(orgId: number, start: Date, end: Date) {
    const res = await db
      .select({
        reservations: reservationTable
      })
      .from(reservationTable)
      .where(
        and(
          eq(reservationTable.orgId, orgId),
          or(
            and(gte(reservationTable.start, start), lte(reservationTable.start, end)),
            and(gte(reservationTable.end, start), lte(reservationTable.end, end)),
            and(lte(reservationTable.start, start), gte(reservationTable.end, end))
          )
        )
      );

    return res.map((entry) => entry.reservations);
  }

  static async getByItemIdAndOrgIdBetweenDates(
    orgId: number,
    itemId: number,
    start: Date,
    end: Date
  ) {
    const res = await db
      .select({
        reservations: reservationTable
      })
      .from(reservationTable)
      .where(
        and(
          eq(reservationTable.itemId, itemId),
          eq(reservationTable.orgId, orgId),
          or(
            and(gte(reservationTable.start, start), lte(reservationTable.start, end)),
            and(gte(reservationTable.end, start), lte(reservationTable.end, end)),
            and(lte(reservationTable.start, start), gte(reservationTable.end, end))
          )
        )
      );

    return res.map((entry) => entry.reservations);
  }

  static async getRequestsByOrgPath(orgPath: string) {
    const res = await db
      .select({
        itemId: reservationTable.itemId,
        reservations: sql<
          ReservationWithBorrowerName[]
        >`coalesce(json_agg(to_jsonb(${reservationTable}) || jsonb_build_object('borrowerName', ${user.name})), '[]'::json)`
      })
      .from(orgTable)
      .innerJoin(orgItemTable, eq(orgItemTable.orgId, orgTable.id))
      .innerJoin(
        reservationTable,
        and(
          eq(reservationTable.itemId, orgItemTable.itemId),
          eq(reservationTable.status, 'pending')
        )
      )
      .innerJoin(user, eq(user.id, reservationTable.borrower))
      .where(eq(orgTable.path, orgPath));

    return res;
  }
}
