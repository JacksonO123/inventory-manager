import { c } from '../../contract';
import { z } from 'zod';

export const adminRouter = c.router(
  {
    isAdmin: {
      path: '/is-admin',
      method: 'GET',
      query: z.object({
        id: z.string().min(1)
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
