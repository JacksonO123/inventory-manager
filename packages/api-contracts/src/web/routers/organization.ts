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
        500: errorMsgSchema
      }
    },
    update: {
      path: '/update',
      method: 'PATCH',
      body: orgSchema,
      responses: {
        200: c.noBody(),
        500: errorMsgSchema
      }
    },
    delete: {
      path: '/delete',
      method: 'DELETE',
      body: z.object({ id: z.number().int().gte(0) }),
      responses: {
        200: c.noBody(),
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
        500: errorMsgSchema
      }
    },
    getInfoForAdmin: {
      path: '/get',
      method: 'GET',
      responses: {
        200: z.array(z.object({ org: orgSchema, items: z.array(itemSchema) })),
        500: errorMsgSchema
      }
    },
    getMembers: {
      path: '/get-members/:orgPath',
      method: 'GET',
      pathParams: z.object({
        orgPath: z.string().min(1)
      }),
      responses: {
        200: z.array(partialAdminSchema.extend({ email: z.email() })),
        500: errorMsgSchema
      }
    },
    addMember: {
      path: '/add-member/:orgPath',
      method: 'POST',
      pathParams: z.object({
        orgPath: z.string().min(1)
      }),
      body: z.object({ email: z.email() }),
      responses: {
        200: partialAdminSchema,
        500: errorMsgSchema
      }
    },
    removeMember: {
      path: '/remove-member/:orgPath',
      method: 'DELETE',
      pathParams: z.object({
        orgPath: z.string().min(1)
      }),
      body: partialAdminSchema,
      responses: {
        200: c.noBody(),
        500: errorMsgSchema
      }
    },
    isValidNewMember: {
      path: '/check-valid-new-member',
      method: 'POST',
      body: z.object({
        email: z.email(),
        orgPath: z.string().min(1)
      }),
      responses: {
        200: z.object({
          valid: z.boolean()
        }),
        500: errorMsgSchema
      }
    }
  },
  { pathPrefix: '/org' }
);
