import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './packages/inventory-db-utils/src/schema.ts',
  out: './packages/inventory-db-utils/migrations',
  dialect: 'postgresql'
});
