import { errorMsgSchema } from '@invm/api-contracts/schemas';
import { c } from '../../contract';
import { z } from 'zod';

export const userRouter = c.router(
  {
    getAdminStatus: {
      path: '/get-admin-status',
      method: 'GET',
      responses: {
        200: z.object({
          admin: z.boolean(),
          superAdmin: z.boolean()
        }),
        500: errorMsgSchema
      }
    }
  },
  { pathPrefix: '/user' }
);
