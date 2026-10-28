import { z } from 'zod';

export const itemSchema = z.object({
  id: z.number().gte(0),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).nullable(),
  status: z.enum(['available', 'booked', 'out_of_service'])
});

export const partialItemSchema = itemSchema.omit({ id: true, status: true });

export const basicUserSchema = z.object({
  id: z.number().gte(0),
  name: z.string().trim().min(1),
  email: z.email()
});

export const basicUserSchemaOmitId = basicUserSchema.omit({ id: true });
