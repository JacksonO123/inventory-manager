import { adminSchema, errorMsgSchema } from '@invm/api-contracts/schemas';
import { c } from '../../contract';
import { z } from 'zod';

export const adminRouter = c.router(
  {
    addAdmin: {
      path: '/add',
      method: 'PUT',
      body: z.object({
        email: z.email()
      }),
      responses: {
        200: z.object({
          userId: z.string().min(1)
        }),
        500: errorMsgSchema,
        401: errorMsgSchema
      }
    },
    getAllWithEmail: {
      path: '/get-all',
      method: 'GET',
      responses: {
        200: z.object({
          admins: z.array(adminSchema.extend({ email: z.email() }))
        }),
        500: errorMsgSchema,
        401: errorMsgSchema
      }
    },
    revokeAdmin: {
      path: '/revoke',
      method: 'DELETE',
      body: z.object({
        userId: z.string().min(1)
      }),
      responses: {
        200: c.noBody(),
        500: errorMsgSchema,
        401: errorMsgSchema
      }
    },
    promote: {
      path: '/promote',
      method: 'PATCH',
      body: z.object({
        userId: z.string().min(1)
      }),
      responses: {
        200: c.noBody(),
        500: errorMsgSchema,
        401: errorMsgSchema
      }
    }
  },
  { pathPrefix: '/admin' }
);
