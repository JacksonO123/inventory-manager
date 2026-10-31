import { errorMsgSchema, adminSchema } from '../../schemas';
import { c } from '../../contract';
import { z } from 'zod';

export const superAdminRouter = c.router(
  {
    isSuperAdmin: {
      path: '/is-super-admin',
      method: 'POST',
      body: z.object({
        id: z.string().min(1)
      }),
      responses: {
        200: z.object({
          isAdmin: z.boolean()
        }),
        500: errorMsgSchema,
        401: errorMsgSchema
      }
    },
    isValidSuperAdminEmail: {
      path: '/is-valid-super-admin-email',
      method: 'POST',
      body: z.object({
        email: z.email()
      }),
      responses: {
        200: z.object({
          status: z.enum(['super_admin_exists', 'no_user_exists', 'success'])
        }),
        500: errorMsgSchema,
        401: errorMsgSchema
      }
    },
    isValidAdminEmail: {
      path: '/is-valid-admin-email',
      method: 'POST',
      body: z.object({
        email: z.email()
      }),
      responses: {
        200: z.object({
          status: z.enum(['admin_exists', 'no_user_exists', 'success'])
        }),
        500: errorMsgSchema,
        401: errorMsgSchema
      }
    },
    addSuperAdmin: {
      path: '/add',
      method: 'PUT',
      body: z.object({
        email: z.email()
      }),
      responses: {
        200: z.object({
          id: z.number().gte(0),
          user_id: z.string().min(1)
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
        })
      }
    },
    revokeAdmin: {
      path: '/revoke',
      method: 'DELETE',
      body: z.object({
        id: z.number().gte(0)
      }),
      responses: {
        200: c.noBody(),
        500: errorMsgSchema,
        401: errorMsgSchema
      }
    },
    demote: {
      path: '/demote',
      method: 'PATCH',
      body: z.object({
        id: z.number().gte(0)
      }),
      responses: {
        200: z.object({
          id: z.number().gte(0)
        }),
        500: errorMsgSchema,
        401: errorMsgSchema
      }
    }
  },
  { pathPrefix: '/super-admin' }
);
