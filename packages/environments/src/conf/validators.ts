import { z } from 'zod';
import { environmentSchema } from '../lib/types';

export const webValidator = z.object({
  NEXT_PUBLIC_ENVIRONMENT: environmentSchema,
  NEXT_PUBLIC_API_BASE_URL: z.url(),
  NEXT_PUBLIC_WEB_BASE_URL: z.url(),

  INVENTORY_DB_USERNAME: z.string().min(1),
  INVENTORY_DB_PASSWORD: z.string().min(1),
  INVENTORY_DB_HOST: z.string().min(1),
  INVENTORY_DB_PORT: z.number().gte(0),
  INVENTORY_DB_NAME: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1)
});
