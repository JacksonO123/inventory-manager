import {
  errorMsgSchema,
  itemSchema,
  orgSchema,
  partialAdminSchema
} from '@invm/api-contracts/schemas';
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
      body: orgSchema.omit({ id: true }),
      responses: {
        200: z.object({ id: z.number().int().gte(0) }),
        500: errorMsgSchema,
        401: errorMsgSchema
      }
    },
    getPositions: {
      path: '/get-positions',
      method: 'GET',
      responses: {
        200: z.array(z.number().int().gte(0)),
        500: errorMsgSchema,
        401: errorMsgSchema
      }
    },
    setPositions: {
      path: '/set-positions',
      method: 'POST',
      body: z.object({
        positions: z.array(z.number().int().gte(0))
      }),
      responses: {
        200: c.noBody(),
        401: errorMsgSchema,
        500: errorMsgSchema
      }
    },
    update: {
      path: '/update',
      method: 'PATCH',
      body: orgSchema,
      responses: {
        200: c.noBody(),
        401: errorMsgSchema,
        500: errorMsgSchema
      }
    },
    delete: {
      path: '/delete',
      method: 'DELETE',
      body: z.object({ id: z.number().int().gte(0) }),
      responses: {
        200: c.noBody(),
        401: errorMsgSchema,
        500: errorMsgSchema
      }
    },
    getByPath: {
      path: '/get/:path',
      method: 'GET',
      pathParams: z.object({
        path: z.string().min(1)
      }),
      responses: {
        200: z.object({ org: orgSchema.nullable() }),
        401: errorMsgSchema,
        404: errorMsgSchema,
        500: errorMsgSchema
      }
    },
    getOrgsForAdmin: {
      path: '/get-orgs-for-admin',
      method: 'GET',
      responses: {
        200: z.array(orgSchema),
        401: errorMsgSchema,
        500: errorMsgSchema
      }
    },
    getInfoForAdmin: {
      path: '/get-info-for-admin',
      method: 'GET',
      responses: {
        200: z.array(z.object({ org: orgSchema, items: z.array(itemSchema) })),
        401: errorMsgSchema,
        500: errorMsgSchema
      }
    },
    getAdminMembers: {
      path: '/get-admin-members/:orgPath',
      method: 'GET',
      pathParams: z.object({
        orgPath: z.string().min(1)
      }),
      responses: {
        200: z.array(partialAdminSchema.extend({ email: z.email() })),
        401: errorMsgSchema,
        500: errorMsgSchema
      }
    },
    addAdminMember: {
      path: '/add-admin-member/:orgPath',
      method: 'POST',
      pathParams: z.object({
        orgPath: z.string().min(1)
      }),
      body: z.object({ email: z.email() }),
      responses: {
        200: partialAdminSchema,
        401: errorMsgSchema,
        404: errorMsgSchema,
        500: errorMsgSchema
      }
    },
    removeAdminMember: {
      path: '/remove-admin-member/:orgPath',
      method: 'DELETE',
      pathParams: z.object({
        orgPath: z.string().min(1)
      }),
      body: partialAdminSchema,
      responses: {
        200: c.noBody(),
        401: errorMsgSchema,
        404: errorMsgSchema,
        500: errorMsgSchema
      }
    },
    isValidNewAdminMember: {
      path: '/check-valid-new-admin-member',
      method: 'POST',
      body: z.object({
        email: z.email(),
        orgPath: z.string().min(1)
      }),
      responses: {
        200: z.object({
          valid: z.boolean(),
          error: z.string().min(1).optional()
        }),
        401: errorMsgSchema,
        500: errorMsgSchema
      }
    },
    isValidNewUserMember: {
      path: '/check-valid-new-user-member',
      method: 'POST',
      body: z.object({
        email: z.email(),
        orgPath: z.string().min(1)
      }),
      responses: {
        200: z.object({
          valid: z.boolean(),
          error: z.string().min(1).optional()
        }),
        401: errorMsgSchema,
        500: errorMsgSchema
      }
    },
    addUserMember: {
      path: '/add-user-member/:orgPath',
      method: 'POST',
      pathParams: z.object({
        orgPath: z.string().min(1)
      }),
      body: z.object({ email: z.email() }),
      responses: {
        200: partialAdminSchema,
        401: errorMsgSchema,
        404: errorMsgSchema,
        500: errorMsgSchema
      }
    },
    removeUserMember: {
      path: '/remove-user-member/:orgPath',
      method: 'DELETE',
      pathParams: z.object({
        orgPath: z.string().min(1)
      }),
      body: partialAdminSchema,
      responses: {
        200: c.noBody(),
        401: errorMsgSchema,
        404: errorMsgSchema,
        500: errorMsgSchema
      }
    },
    getUserMembers: {
      path: '/get-user-members/:orgPath',
      method: 'GET',
      pathParams: z.object({
        orgPath: z.string().min(1)
      }),
      responses: {
        200: z.array(partialAdminSchema.extend({ email: z.email() })),
        401: errorMsgSchema,
        500: errorMsgSchema
      }
    }
  },

  { pathPrefix: '/org' }
);
