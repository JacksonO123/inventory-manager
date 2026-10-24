import { itemSchema } from '@invm/api-contracts/schemas';
import { z } from 'zod';

export type Item = z.infer<typeof itemSchema>;

export type PartialItem = Omit<Item, 'id'>;
