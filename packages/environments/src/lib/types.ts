import { z } from 'zod';

export const environmentSchema = z.enum(['development', 'staging', 'production']);

export type Environment = z.infer<typeof environmentSchema>;
