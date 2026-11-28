import { createDb } from './db';

describe('createDb', () => {
  it('returns a drizzle instance wired to the given pool', () => {
    // drizzle does not connect at construction time, so a bare object is enough.
    const pool = {} as never;
    const db = createDb(pool, false);

    expect(typeof db.select).toBe('function');
    expect(typeof db.insert).toBe('function');
    expect(typeof db.transaction).toBe('function');
  });
});
