import { z } from 'zod';

export const errorMsgSchema = z.object({ message: z.string().min(1) });
