import { Pool } from 'pg';
import { env } from '../env';
import { createDb, getConnectionUrl } from '@invm/inventory-db-utils';

const connectionString = getConnectionUrl(
  env.INVENTORY_DB_USERNAME,
  env.INVENTORY_DB_PASSWORD,
  env.INVENTORY_DB_HOST,
  env.INVENTORY_DB_PORT,
  env.INVENTORY_DB_NAME
);

const pool = new Pool({ connectionString });

process.on('SIGTERM', () => pool.end());

export const db = createDb(pool, env.ENVIRONMENT === 'development');
