import { hoursBetween, tsrErrorMessage, groupItems, extractBodyOrDefault, dedupeReservations } from './utils';
import type { Item, Org, Reservation } from '../types/types';

describe('hoursBetween', () => {
  it('returns the number of hours between two dates', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const end = new Date('2026-01-01T06:00:00Z');

    expect(hoursBetween(start, end)).toBe(6);
  });

  it('returns a fractional value for sub-hour spans', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const end = new Date('2026-01-01T00:30:00Z');

    expect(hoursBetween(start, end)).toBeCloseTo(0.5);
  });

  it('returns a negative value when the end is before the start', () => {
    const start = new Date('2026-01-01T12:00:00Z');
    const end = new Date('2026-01-01T00:00:00Z');

    expect(hoursBetween(start, end)).toBe(-12);
  });

  it('returns zero for identical dates', () => {
    const date = new Date('2026-01-01T00:00:00Z');

    expect(hoursBetween(date, date)).toBe(0);
  });
});

describe('tsrErrorMessage', () => {
  it('returns the message when the body is an object with a string message', () => {
    expect(tsrErrorMessage({ message: 'boom' }, 'fallback')).toBe('boom');
  });

  it('returns the fallback when the body is an object without a message', () => {
    expect(tsrErrorMessage({ foo: 'bar' }, 'fallback')).toBe('fallback');
  });

  it('returns the fallback when the message is empty', () => {
    expect(tsrErrorMessage({ message: '' }, 'fallback')).toBe('fallback');
  });

  it('returns the fallback when the message is not a string', () => {
    expect(tsrErrorMessage({ message: 42 }, 'fallback')).toBe('fallback');
  });

  it('returns the fallback when the body is null', () => {
    expect(tsrErrorMessage(null, 'fallback')).toBe('fallback');
  });

  it('returns the fallback when the body is a primitive', () => {
    expect(tsrErrorMessage('not an object', 'fallback')).toBe('fallback');
  });
});

describe('groupItems', () => {
  const itemA: Item = { id: 1, name: 'A', description: null, status: 'available' };
  const itemB: Item = { id: 2, name: 'B', description: null, status: 'booked' };

  it('groups items by org object id', () => {
    const org1: Org = { id: 1, name: 'org1', description: 'd', svgDataUrl: null, path: 'org1' };
    const org2: Org = { id: 2, name: 'org2', description: 'd', svgDataUrl: null, path: 'org2' };

    const result = groupItems([
      { org: org1, items: [itemA] },
      { org: org2, items: [itemB] }
    ]);

    expect(result).toEqual({ 1: [itemA], 2: [itemB] });
  });

  it('groups items by orgId number', () => {
    const result = groupItems([
      { orgId: 1, items: [itemA] },
      { orgId: 2, items: [itemB] }
    ]);

    expect(result).toEqual({ 1: [itemA], 2: [itemB] });
  });

  it('returns an empty record for an empty input', () => {
    expect(groupItems([])).toEqual({});
  });

  it('keeps empty item arrays for orgs without items', () => {
    const org1: Org = { id: 1, name: 'org1', description: 'd', svgDataUrl: null, path: 'org1' };

    const result = groupItems([{ org: org1, items: [] }]);

    expect(result).toEqual({ 1: [] });
  });
});

describe('extractBodyOrDefault', () => {
  it('returns the body when the status is 200', () => {
    const response = { status: 200 as const, body: { id: 1 } };

    expect(extractBodyOrDefault(response, { id: 0 })).toEqual({ id: 1 });
  });

  it('returns the default value for a non-200 status', () => {
    const response = { status: 500 as const, body: { message: 'boom' } };

    expect(extractBodyOrDefault<{ id: number }>(response, { id: 0 })).toEqual({ id: 0 });
  });
});

describe('dedupeReservations', () => {
  const base = {
    orgId: 1,
    itemId: 1,
    status: 'pending' as const,
    start: new Date('2026-01-01T00:00:00Z'),
    end: new Date('2026-01-01T01:00:00Z'),
    allDay: false,
    borrower: 'u1'
  };

  const reservation = (id: string): Reservation => ({ id, ...base });

  it('removes duplicate reservations by id, keeping the last occurrence', () => {
    const first = reservation('r1');
    const duplicate = { ...reservation('r1'), borrower: 'u2' };

    const result = dedupeReservations([first, reservation('r2'), duplicate]);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(reservation('r2'));
    expect(result).toContainEqual(duplicate);
  });

  it('returns an empty array for an empty input', () => {
    expect(dedupeReservations([])).toEqual([]);
  });

  it('preserves order for unique reservations', () => {
    const result = dedupeReservations([reservation('r1'), reservation('r2'), reservation('r3')]);

    expect(result.map((r) => r.id)).toEqual(['r1', 'r2', 'r3']);
  });
});
