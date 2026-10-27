import { z } from 'zod';

export const itemSchema = z.object({
  id: z.number().gte(0),
  name: z.string().min(1),
  description: z.string().min(1).nullable()
});

export const itemSchemaOmitId = itemSchema.omit({ id: true });

export const basicUserSchema = z.object({
  id: z.number().gte(0),
  name: z.string().min(1),
  email: z.email()
});
