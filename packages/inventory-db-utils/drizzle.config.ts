import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './packages/core-db-utils/src/schema.ts',
  out: './packages/core-db-utils/migrations',
  dialect: 'postgresql'
});
