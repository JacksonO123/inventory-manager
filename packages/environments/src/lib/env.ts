import { z } from 'zod';
import { envSchema } from '../conf/env-schema';

const environmentSchema = z.enum(['development', 'staging', 'production']);

type InventoryManagerEnv = z.infer<typeof envSchema> & {
  environment: z.infer<typeof environmentSchema>;
};

const environment = environmentSchema.safeParse(process.env.ENVIRONMENT);
if (environment.success === false) {
  console.error('Invalid environment config:', environment.error);
  throw new Error('Invalid environment config ' + environment.error);
}

const jsonSecrets = require(`../secrets/secrets.${environment.data}.json`);
const parsed = envSchema.safeParse(jsonSecrets);

if (!parsed.success) {
  console.error('Invalid env:', parsed.error);
  throw new Error('Invalid environment variables');
}

export const env: InventoryManagerEnv = { ...parsed.data, environment: environment.data };
