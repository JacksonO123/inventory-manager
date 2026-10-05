import { z } from 'zod';
import { webValidator } from './validators';
import { env } from '../lib/env';
import { EnvContents } from '../lib/types';
import { createEnvWithValidator } from '../lib/utils';

export const appEnvContents: Record<string, EnvContents<z.ZodObject>> = {
  web: createEnvWithValidator(webValidator, {
    dir: 'apps/web',
    envVars: {
      NEXT_PUBLIC_ENVIRONMENT: env.environment,
      NEXT_PUBLIC_API_BASE_URL: env.api.baseUrl,
      NEXT_PUBLIC_WEB_BASE_URL: env.web.baseUrl,

      INVENTORY_DB_USERNAME: env.inventory_db.username,
      INVENTORY_DB_PASSWORD: env.inventory_db.password,
      INVENTORY_DB_HOST: env.inventory_db.host,
      INVENTORY_DB_PORT: env.inventory_db.port,
      INVENTORY_DB_NAME: env.inventory_db.dbName,
      BETTER_AUTH_SECRET: env.web.betterAuthSecret,
      GOOGLE_CLIENT_ID: env.web.googleClientId,
      GOOGLE_CLIENT_SECRET: env.web.googleClientSecret
    }
  })
};
