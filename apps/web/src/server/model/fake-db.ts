import { CasingCache } from 'drizzle-orm/casing';

/**
 * A minimal in-memory stand-in for the drizzle `db` instance used by the
 * server models.
 *
 * Every query entry point (`select`, `insert`, `update`, `delete`) returns a
 * chainable, thenable builder. Each time a builder is awaited it consumes the
 * next result from a queue, so tests can script the rows returned by a sequence
 * of queries (important because e.g. `Org.create` mixes a `tx.select` count
 * with a `db.insert` that expect different rows). `transaction` runs the
 * callback with a builder bound to the same queue.
 *
 * A shared `fakeDb` singleton is exported so a `jest.mock('../db', ...)` factory
 * (which is hoisted above the test file's own statements) can reference it via
 * `require` without hitting a temporal-dead-zone error.
 */
export type RenderedQuery = { sql: string; params: unknown[] };

/** A drizzle SQL expression (as passed to a builder's `where`/`set`/`values`). */
export type SqlExpr = { toQuery: (config: unknown) => RenderedQuery };

/**
 * Render a drizzle SQL expression (e.g. the value passed to a builder's
 * `where`) to its concrete `{ sql, params }` form, so tests can assert on the
 * actual filter rather than just that `where` was called.
 *
 * A fresh `paramStartIndex` is created per call so params always start at `$1`
 * regardless of how many times rendering has happened before.
 */
export function renderSql(expr: SqlExpr): RenderedQuery {
  const config = {
    casing: new CasingCache('snake_case'),
    escapeName: (name: string) => `"${name}"`,
    escapeParam: (num: number) => `$${num}`,
    escapeString: (str: string) => `'${str.replace(/'/g, "''")}'`,
    paramStartIndex: { value: 1 }
  };
  const query = expr.toQuery(config);
  return { sql: query.sql, params: query.params };
}

/**
 * A chainable, thenable query builder. Every chainable method is a jest mock
 * that returns the builder itself, so specs can assert on the arguments a
 * method was called with (e.g. `where`, `set`, `values`) and the builder can
 * be awaited for the next queued result.
 */
export type FakeBuilder = {
  select: jest.Mock;
  from: jest.Mock;
  innerJoin: jest.Mock;
  leftJoin: jest.Mock;
  rightJoin: jest.Mock;
  fullJoin: jest.Mock;
  where: jest.Mock;
  groupBy: jest.Mock;
  orderBy: jest.Mock;
  limit: jest.Mock;
  offset: jest.Mock;
  returning: jest.Mock;
  values: jest.Mock;
  set: jest.Mock;
  onConflictDoUpdate: jest.Mock;
  onConflictDoNothing: jest.Mock;
  update: jest.Mock;
  insert: jest.Mock;
  delete: jest.Mock;
  then: (resolve: (value: unknown) => void, reject?: (reason: unknown) => void) => Promise<unknown>;
};

export function createFakeDb(initialResults: unknown[] = []) {
  const queue: unknown[] = [...initialResults];
  const builders: FakeBuilder[] = [];

  function makeBuilder(): FakeBuilder {
    const builder: Record<string, unknown> = {};
    const chainable = [
      'select',
      'from',
      'innerJoin',
      'leftJoin',
      'rightJoin',
      'fullJoin',
      'where',
      'groupBy',
      'orderBy',
      'limit',
      'offset',
      'returning',
      'values',
      'set',
      'onConflictDoUpdate',
      'onConflictDoNothing',
      'update',
      'insert',
      'delete'
    ];
    for (const method of chainable) {
      builder[method] = jest.fn().mockReturnValue(builder);
    }
    // The builder is intentionally a thenable so specs can `await` it for the next queued result.
    // oxlint-disable-next-line unicorn/no-thenable
    builder.then = (resolve: (value: unknown) => void, reject?: (reason: unknown) => void) =>
      Promise.resolve(queue.shift() ?? []).then(resolve, reject);
    const fakeBuilder = builder as FakeBuilder;
    builders.push(fakeBuilder);
    return fakeBuilder;
  }

  const db: Record<string, unknown> = {
    select: jest.fn().mockImplementation(() => makeBuilder()),
    insert: jest.fn().mockImplementation(() => makeBuilder()),
    update: jest.fn().mockImplementation(() => makeBuilder()),
    delete: jest.fn().mockImplementation(() => makeBuilder()),
    transaction: jest.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(makeBuilder()))
  };

  return {
    db,
    /** Queue the rows the next awaited query will resolve to. */
    queue(...results: unknown[]) {
      queue.push(...results);
    },
    /** Drop any queued results. */
    clear() {
      queue.length = 0;
      builders.length = 0;
    },
    /** The rows still queued for future awaited queries. */
    get pending() {
      return queue;
    },
    /** Every builder created so far (oldest first). */
    get builders(): FakeBuilder[] {
      return builders;
    },
    /** The most recently created builder. */
    get lastBuilder(): FakeBuilder {
      return builders[builders.length - 1]!;
    },
    /**
     * The first argument passed to the most recent builder's `where` — the raw
     * drizzle SQL expression, ready to hand to `render`.
     */
    get lastWhere(): SqlExpr {
      return this.lastBuilder.where.mock.calls[0]![0] as SqlExpr;
    },
    /** Render a captured drizzle SQL expression (e.g. a `where` arg) to `{ sql, params }`. */
    render(expr: SqlExpr): RenderedQuery {
      return renderSql(expr);
    }
  };
}

export type FakeDb = ReturnType<typeof createFakeDb>;

/** Shared instance used by the hoisted `jest.mock('../db')` factories. */
export const fakeDb: FakeDb = createFakeDb();
