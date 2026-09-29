import { dbEnv } from '@homelab/environments/db';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { getConnectionUrl } from './utils';

const { inventory_db } = dbEnv;
const url = getConnectionUrl(
  inventory_db.username,
  inventory_db.password,
  inventory_db.host,
  inventory_db.port,
  inventory_db.dbName
);

const pool = new Pool({ connectionString: url });

(async () => {
  try {
    const db = drizzle(pool);
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: './packages/core-db-utils/migrations' });
    console.log('Migrations completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
