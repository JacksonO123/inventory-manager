import {
  adminSchema,
  basicUserSchema,
  basicUserSchemaOmitId,
  itemSchema,
  partialItemSchema,
  userSchema
} from '@invm/api-contracts/schemas';
import { z } from 'zod';

export type Item = z.infer<typeof itemSchema>;

export type PartialItem = z.infer<typeof partialItemSchema>;

export type BasicUser = z.infer<typeof basicUserSchema>;

export type PartialBasicUser = z.infer<typeof basicUserSchemaOmitId>;

export type AuthTypes = 'signup' | 'login';

export type Admin = z.infer<typeof adminSchema>;

export type User = z.infer<typeof userSchema>;

export type AdminAndEmail = Admin & { email: string };

export type ServerErrorRes = { error: string | undefined } | null;
