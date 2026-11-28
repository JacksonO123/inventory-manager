import { toDate } from './utils';

describe('toDate', () => {
  it('returns a Date for a Date input', () => {
    const input = new Date('2026-01-01T12:00:00Z');

    expect(toDate(input)).toEqual(input);
  });

  it('returns a Date for an ISO string input', () => {
    const result = toDate('2026-01-01T12:00:00Z');

    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2026-01-01T12:00:00.000Z');
  });

  it('returns a Date for a numeric timestamp input', () => {
    const timestamp = new Date('2026-01-01T12:00:00Z').getTime();

    expect(toDate(timestamp)).toEqual(new Date(timestamp));
  });

  it('returns a Date constructed from a [y, m, d, h, min, s, ms] array', () => {
    const result = toDate([2026, 0, 1, 12, 0, 0, 0] as unknown as Date);

    expect(result).toEqual(new Date(2026, 0, 1, 12, 0, 0, 0));
  });
});
