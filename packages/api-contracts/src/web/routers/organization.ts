import { errorMsgSchema, orgSchema } from '@invm/api-contracts/schemas';
import { c } from '../../contract';
import { z } from 'zod';

export const organizationRouter = c.router(
  {
    getAll: {
      path: '/get-all',
      method: 'GET',
      responses: {
        200: z.array(orgSchema),
        500: errorMsgSchema,
        401: errorMsgSchema
      }
    },
    create: {
      path: '/create',
      method: 'POST',
      body: orgSchema.omit({ id: true, location: true }),
      responses: {
        200: z.object({
          id: z.number().int().gte(0),
          location: z.number().int().gte(0)
        }),
        500: errorMsgSchema,
        401: errorMsgSchema
      }
    }
  },
  { pathPrefix: '/org' }
);
