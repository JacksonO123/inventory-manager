import { z } from 'zod';

export const internalUtilEntrySchema = z.object({
  name: z.string().min(1),
  link: z.string().min(1),
  svgDataUrl: z.string().min(1),
  id: z.number().gte(0)
});
