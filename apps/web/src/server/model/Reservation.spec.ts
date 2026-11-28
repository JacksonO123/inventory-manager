/**
 * @jest-environment node
 */
import { Reservation } from './Reservation';
import { fakeDb } from './fake-db';
import { reservationTable } from '@invm/inventory-db-utils';

jest.mock('../db', () => ({ db: require('./fake-db').fakeDb.db }));

const start = new Date('2026-01-01T00:00:00Z');
const end = new Date('2026-01-01T01:00:00Z');
const partial = { orgId: 1, itemId: 1, start, end, allDay: false };

afterEach(() => {
  jest.clearAllMocks();
  fakeDb.clear();
});

describe('Reservation.create', () => {
  it('checks for conflicts scoped to the item, excluding canceled, with a time-overlap window', async () => {
    fakeDb.queue([{ id: 99 }]); // conflict found

    await expect(Reservation.create(partial, 'u1', 'pending')).resolves.toBeNull();

    // The conflict query must be scoped to this item, ignore canceled rows, and
    // match any reservation whose [start, end] overlaps the requested window.
    expect(fakeDb.render(fakeDb.lastWhere)).toEqual({
      sql: '("reservation"."item_id" = $1 and "reservation"."status" <> $2 and (("reservation"."start" < $3 and "reservation"."end" > $4) or ("reservation"."start" < $5 and "reservation"."end" > $6) or ("reservation"."start" > $7 and "reservation"."end" < $8)))',
      params: [1, 'canceled', start.toISOString(), start.toISOString(), end.toISOString(), end.toISOString(), start.toISOString(), end.toISOString()]
    });
  });

  it('inserts and returns a Reservation with the id converted to a string', async () => {
    fakeDb.queue(
      [], // no conflicts
      [
        {
          id: 42,
          orgId: 1,
          itemId: 1,
          status: 'pending',
          start,
          end,
          allDay: false,
          borrower: 'u1'
        }
      ]
    );

    const reservation = await Reservation.create(partial, 'u1', 'pending');

    expect(reservation).toBeInstanceOf(Reservation);
    expect(reservation?.values.id).toBe('42'); // number 42 -> string '42'
    expect(reservation?.values.borrower).toBe('u1');
  });
});

describe('Reservation.accept', () => {
  it('marks the reservation accepted, scoped to the item and pending status', async () => {
    fakeDb.queue([{ id: 42 }]);
    await Reservation.accept(7, 42);

    expect(fakeDb.db.update).toHaveBeenCalledWith(reservationTable);
    expect(fakeDb.lastBuilder.set).toHaveBeenCalledWith({ status: 'accepted' });
    expect(fakeDb.render(fakeDb.lastWhere)).toEqual({
      sql: '("reservation"."id" = $1 and "reservation"."item_id" = $2 and "reservation"."status" = $3)',
      params: [42, 7, 'pending']
    });
  });

  it('throws a 404 when the reservation does not match', async () => {
    fakeDb.queue([]);
    await expect(Reservation.accept(1, 1)).rejects.toMatchObject({ status: 404 });
  });
});

describe('Reservation.reject', () => {
  it('marks the reservation canceled, scoped to the item and pending status', async () => {
    fakeDb.queue([{ id: 42 }]);
    await Reservation.reject(7, 42);

    expect(fakeDb.db.update).toHaveBeenCalledWith(reservationTable);
    expect(fakeDb.lastBuilder.set).toHaveBeenCalledWith({ status: 'canceled' });
    expect(fakeDb.render(fakeDb.lastWhere)).toEqual({
      sql: '("reservation"."id" = $1 and "reservation"."item_id" = $2 and "reservation"."status" = $3)',
      params: [42, 7, 'pending']
    });
  });

  it('throws a 404 when the reservation does not match', async () => {
    fakeDb.queue([]);
    await expect(Reservation.reject(1, 1)).rejects.toMatchObject({ status: 404 });
  });
});

describe('Reservation.getByOrgIdBetweenDates', () => {
  it('spreads each reservation and attaches the borrower name', async () => {
    const row = {
      reservations: { id: 1, orgId: 1, itemId: 1, status: 'accepted', start, end, allDay: false, borrower: 'u1' },
      borrowerName: 'Alice'
    };
    fakeDb.queue([row]);

    const result = await Reservation.getByOrgIdBetweenDates(1, start, end);

    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe(1);
    expect(result[0]!.borrowerName).toBe('Alice');
  });

  it('omits borrowerName when the borrower user is missing (null)', async () => {
    fakeDb.queue([
      {
        reservations: { id: 2, orgId: 1, itemId: 1, status: 'accepted', start, end, allDay: false, borrower: 'u2' },
        borrowerName: null
      }
    ]);

    const result = await Reservation.getByOrgIdBetweenDates(1, start, end);

    expect(result[0]!.borrowerName).toBeUndefined();
  });
});

describe('Reservation.getByItemIdAndOrgIdBetweenDates', () => {
  it('returns the reservation rows', async () => {
    const res = { id: 1, orgId: 1, itemId: 1, status: 'accepted', start, end, allDay: false, borrower: 'u1' };
    fakeDb.queue([{ reservations: res }]);

    await expect(Reservation.getByItemIdAndOrgIdBetweenDates(1, 1, start, end)).resolves.toEqual([res]);
  });
});

describe('Reservation.getAllByOrgPath', () => {
  it('returns Reservation instances with string ids and borrower names', async () => {
    fakeDb.queue([
      {
        reservation: { id: 7, orgId: 1, itemId: 1, status: 'accepted', start, end, allDay: false, borrower: 'u1' },
        borrowerName: 'Alice'
      }
    ]);

    const result = await Reservation.getAllByOrgPath('org1');

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Reservation);
    expect(result[0]!.values.id).toBe('7'); // number -> string
    expect(result[0]!.values.borrowerName).toBe('Alice');
  });
});
