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
    }
  },
  { pathPrefix: '/org' }
);
