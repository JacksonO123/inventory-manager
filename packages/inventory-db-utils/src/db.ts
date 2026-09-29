import type { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

export function createDb(pool: Pool, logger: boolean) {
  return drizzle(pool, {
    schema,
    logger
  });
}

export type Db = ReturnType<typeof createDb>;
