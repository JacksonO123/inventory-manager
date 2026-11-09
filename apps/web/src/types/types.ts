import {
  adminSchema,
  basicUserSchema,
  basicUserSchemaOmitId,
  itemSchema,
  orgPositionsSchema,
  orgSchema,
  partialItemSchema,
  userSchema
} from '@invm/api-contracts/schemas';
import { z } from 'zod';

export type Item = z.infer<typeof itemSchema>;

export type ItemAndBasicUserBorrower = Item & { borrower: BasicUser['id'] | null };

export type PartialItem = z.infer<typeof partialItemSchema>;

export type BasicUser = z.infer<typeof basicUserSchema>;

export type PartialBasicUser = z.infer<typeof basicUserSchemaOmitId>;

export type AuthTypes = 'signup' | 'login';

export type Admin = z.infer<typeof adminSchema>;

export type PartialAdmin = Omit<Admin, 'id'>;

export type User = z.infer<typeof userSchema>;

export type AdminAndEmail = Admin & { email: string };

export type PartialAdminAndEmail = PartialAdmin & { email: string };

export type ServerErrorRes<T = unknown> =
  | { status: 'error'; error?: string }
  | { status: 'success'; body: T };

export type IdServerErrorRes = ServerErrorRes<{ userId: string }>;

export type Org = z.infer<typeof orgSchema>;

export type PartialOrg = Omit<Org, 'id'>;

export type OrgPositions = z.infer<typeof orgPositionsSchema>;
