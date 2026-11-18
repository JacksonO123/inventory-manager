import { reservationTable } from '@invm/inventory-db-utils';
import { Event as EventType, PartialEvent } from '../../types/types';
import { db } from '../db';
import { z } from 'zod';
import { eventStatusEnum } from '@invm/api-contracts/schemas';

export class Reservation {
  values: EventType;

  constructor(values: EventType) {
    this.values = values;
  }

  static async create(partialEvent: PartialEvent, status: z.infer<typeof eventStatusEnum>) {
    const [res] = await db
      .insert(reservationTable)
      .values({
        status: status,
        start: partialEvent.start,
        end: partialEvent.end,
        allDay: partialEvent.allDay
      })
      .returning();
    if (res === undefined) {
      throw new Error('Failed to create event');
    }

    const { id, ...others } = res;
    const newEvent = { ...others, id: id + '' };
    return new Reservation(newEvent);
  }
}
