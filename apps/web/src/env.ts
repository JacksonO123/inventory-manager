import { createEnv, environmentSchema } from '@invm/environments';
import { z } from 'zod';

export const env = createEnv({
  client: {
    ENVIRONMENT: environmentSchema,
    API_BASE_URL: z.url()
  },
  server: {
    INVENTORY_DB_USERNAME: z.string().min(1),
    INVENTORY_DB_PASSWORD: z.string().min(1),
    INVENTORY_DB_HOST: z.string().min(1),
    INVENTORY_DB_PORT: z.string().min(1).transform(Number),
    INVENTORY_DB_NAME: z.string().min(1)
  },
  runtimeEnv: {
    ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    INVENTORY_DB_USERNAME: process.env.INVENTORY_DB_USERNAME,
    INVENTORY_DB_PASSWORD: process.env.INVENTORY_DB_PASSWORD,
    INVENTORY_DB_HOST: process.env.INVENTORY_DB_HOST,
    INVENTORY_DB_PORT: process.env.INVENTORY_DB_PORT,
    INVENTORY_DB_NAME: process.env.INVENTORY_DB_NAME
  }
});
