import { reservationTable, orgTable, user } from '@invm/inventory-db-utils';
import { ReservationWithOptionalBorrowerName, PartialReservation } from '../../types/types';
import { db } from '../db';
import { HttpError } from '../errors';
import { z } from 'zod';
import { reservationStatusEnum } from '@invm/api-contracts/schemas';
import { and, eq, gt, gte, lt, lte, ne, or } from 'drizzle-orm';

export class Reservation {
  values: ReservationWithOptionalBorrowerName;

  constructor(values: ReservationWithOptionalBorrowerName) {
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
        and(
          eq(reservationTable.itemId, partialReservation.itemId),
          ne(reservationTable.status, 'canceled'),
          or(
            and(
              lt(reservationTable.start, partialReservation.start),
              gt(reservationTable.end, partialReservation.start)
            ),
            and(
              lt(reservationTable.start, partialReservation.end),
              gt(reservationTable.end, partialReservation.end)
            ),
            and(
              gt(reservationTable.start, partialReservation.start),
              lt(reservationTable.end, partialReservation.end)
            )
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

  static async accept(itemId: number, reservationId: number) {
    const [res] = await db
      .update(reservationTable)
      .set({ status: 'accepted' })
      .where(
        and(
          eq(reservationTable.id, reservationId),
          eq(reservationTable.itemId, itemId),
          eq(reservationTable.status, 'pending')
        )
      )
      .returning({ id: reservationTable.id });
    if (res === undefined) {
      throw new HttpError(404, 'Reservation not found');
    }
  }

  static async reject(itemId: number, reservationId: number) {
    const [res] = await db
      .update(reservationTable)
      .set({ status: 'canceled' })
      .where(
        and(
          eq(reservationTable.id, reservationId),
          eq(reservationTable.itemId, itemId),
          eq(reservationTable.status, 'pending')
        )
      )
      .returning({ id: reservationTable.id });
    if (res === undefined) {
      throw new HttpError(404, 'Reservation not found');
    }
  }

  static async getByOrgIdBetweenDates(orgId: number, start: Date, end: Date) {
    const res = await db
      .select({
        reservations: reservationTable,
        borrowerName: user.name
      })
      .from(reservationTable)
      .leftJoin(user, eq(reservationTable.borrower, user.id))
      .where(
        and(
          eq(reservationTable.orgId, orgId),
          ne(reservationTable.status, 'canceled'),
          or(
            and(gte(reservationTable.start, start), lte(reservationTable.start, end)),
            and(gte(reservationTable.end, start), lte(reservationTable.end, end)),
            and(lte(reservationTable.start, start), gte(reservationTable.end, end))
          )
        )
      );

    return res.map(({ reservations, borrowerName }) => ({
      ...reservations,
      borrowerName: borrowerName ?? undefined
    }));
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
          ne(reservationTable.status, 'canceled'),
          or(
            and(gte(reservationTable.start, start), lte(reservationTable.start, end)),
            and(gte(reservationTable.end, start), lte(reservationTable.end, end)),
            and(lte(reservationTable.start, start), gte(reservationTable.end, end))
          )
        )
      );

    return res.map((entry) => entry.reservations);
  }

  static async getAllByOrgPath(orgPath: string) {
    const res = await db
      .select({ reservation: reservationTable, borrowerName: user.name })
      .from(reservationTable)
      .innerJoin(
        orgTable,
        and(eq(reservationTable.orgId, orgTable.id), eq(orgTable.path, orgPath))
      )
      .leftJoin(user, eq(reservationTable.borrower, user.id))
      .where(ne(reservationTable.status, 'canceled'));
    return res.map(
      ({ reservation, borrowerName }) =>
        new Reservation({
          ...reservation,
          id: reservation.id + '',
          borrowerName: borrowerName ?? undefined
        })
    );
  }
}
