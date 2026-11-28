import { getConnectionUrl } from './utils';

describe('getConnectionUrl', () => {
  it('builds a postgresql connection string', () => {
    expect(getConnectionUrl('user', 'pass', 'localhost', 5432, 'inventory_db')).toBe(
      'postgresql://user:pass@localhost:5432/inventory_db'
    );
  });

  it('places each argument in its position', () => {
    expect(getConnectionUrl('u2', 'p2', 'db.internal', 5433, 'other_db')).toBe(
      'postgresql://u2:p2@db.internal:5433/other_db'
    );
  });
});
