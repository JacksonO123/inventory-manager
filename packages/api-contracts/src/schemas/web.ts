import { z } from 'zod';

export const itemSchema = z.object({
  id: z.number().int().gte(0),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).nullable(),
  is_available: z.boolean(),
  is_lent_out: z.boolean(),
  is_damaged: z.boolean()
});

export const partialItemSchema = itemSchema.omit({
  id: true,
  is_available: true,
  is_lent_out: true
});

export const basicUserSchema = z.object({
  id: z.number().int().gte(0),
  name: z.string().trim().min(1),
  email: z.email()
});

export const basicUserSchemaOmitId = basicUserSchema.omit({ id: true });

export const adminSchema = z.object({
  id: z.number().int().gte(0),
  userId: z.string().min(1)
});

export const partialAdminSchema = adminSchema.omit({ id: true });

export const userSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const orgSchema = z.object({
  id: z.number().int().gte(0),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  svgDataUrl: z.string().trim().min(1).nullable(),
  path: z.string().trim().min(1)
});

export const orgPositionsSchema = z.object({
  id: z.number().int().gte(0),
  userId: z.string().min(1),
  positions: z.array(z.number().int().gte(0))
});

export const eventStatusEnum = z.enum(['accepted', 'pending', 'canceled']);

export const unrefinedReservationSchema = z.object({
  id: z.string().min(1),
  status: eventStatusEnum,
  start: z.coerce.date(),
  end: z.coerce.date(),
  allDay: z.boolean()
});

export const reservationSchema = unrefinedReservationSchema.refine((obj) => obj.start < obj.end, {
  message: 'End date must be after start date'
});

export const partialReservationSchema = unrefinedReservationSchema.omit({ id: true });

export const orgMemberSchema = z.object({
  id: z.number().int().gte(0),
  userId: z.string().min(1),
  orgId: z.number().int().gte(0)
});
