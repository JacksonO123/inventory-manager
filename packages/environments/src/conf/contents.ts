import { z } from 'zod';
import { webValidator } from './validators';
import { env } from '../lib/env';

type EnvContents = {
  dir: string;
  envVars: Record<string, string>;
  validator: z.ZodObject;
};

export const appEnvContents: Record<string, EnvContents> = {
  web: {
    dir: 'apps/web',
    validator: webValidator,
    envVars: {
      NEXT_PUBLIC_ENVIRONMENT: env.environment,
      NEXT_PUBLIC_API_BASE_URL: env.api.baseUrl
    }
  }
};
