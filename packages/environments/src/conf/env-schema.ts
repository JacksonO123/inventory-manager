import { z } from 'zod';

export const envSchema = z.object({
  inventory_db: z.object({
    host: z.string().min(1),
    port: z.string().min(1).transform(Number),
    dbName: z.string().min(1),
    username: z.string().min(1),
    password: z.string().min(1)
  }),
  api: z.object({
    baseUrl: z.url()
  }),
  web: z.object({
    betterAuthSecret: z.string().min(1),
    googleClientId: z.string().min(1),
    googleClientSecret: z.string().min(1),
    baseUrl: z.url()
  })
});
