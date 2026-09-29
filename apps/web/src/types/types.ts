import { internalUtilEntrySchema } from '@homelab/api-contracts/schemas';
import { z } from 'zod';

export type Entry = z.infer<typeof internalUtilEntrySchema>;

export type PartialEntry = Omit<Entry, 'id'>;
