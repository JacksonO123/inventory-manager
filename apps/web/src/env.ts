import { createEnv, environmentSchema } from '@invm/environments';
import { z } from 'zod';

export const env = createEnv({
  client: {
    ENVIRONMENT: environmentSchema,
    API_BASE_URL: z.url()
  },
  server: {},
  runtimeEnv: {
    ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL
  }
});
