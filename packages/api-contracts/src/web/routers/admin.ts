import { c } from '../../contract';
import { z } from 'zod';

export const adminRouter = c.router(
  {
    isAdmin: {
      path: '/is-admin',
      method: 'GET',
      query: z.object({
        id: z.number().gte(0)
      }),
      responses: {
        200: z.object({
          isAdmin: z.boolean()
        })
      }
    }
  },
  { pathPrefix: '/admin' }
);
