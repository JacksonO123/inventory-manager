import { errorMsgSchema } from '@invm/api-contracts/schemas';
import { c } from '../../contract';
import { z } from 'zod';

export const superAdminRouter = c.router(
  {
    isSuperAdmin: {
      path: '/is-super-admin',
      method: 'GET',
      query: z.object({
        id: z.string().min(1)
      }),
      responses: {
        200: z.object({
          isAdmin: z.boolean()
        }),
        500: errorMsgSchema,
        401: errorMsgSchema
      }
    }
  },
  { pathPrefix: '/super-admin' }
);
