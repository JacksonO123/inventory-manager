import { z } from 'zod';
import { environmentSchema } from '../lib/types';

export const webValidator = z.object({
  NEXT_PUBLIC_ENVIRONMENT: environmentSchema,
  NEXT_PUBLIC_API_BASE_URL: z.url()
});
