import { z } from 'zod';

export const environmentSchema = z.enum(['development', 'staging', 'production']);

export type Environment = z.infer<typeof environmentSchema>;

export type EnvContents<T extends z.ZodObject> = {
  dir: string;
  envVars: z.infer<T>;
  validator: T;
};
