import { errorMsgSchema, itemSchema, partialItemSchema } from '@invm/api-contracts/schemas';
import { c } from '../../contract';
import { z } from 'zod';

const itemIdParamsSchema = z.object({ id: z.coerce.number().int().gte(0) });

export const itemRouter = c.router(
  {
    createItem: {
      path: '/create',
      method: 'PUT',
      body: partialItemSchema.extend({ orgId: z.number().int().gte(0) }),
      responses: {
        200: z.object({ id: z.number().gte(0), status: itemSchema.shape.status }),
        401: errorMsgSchema,
        500: errorMsgSchema
      }
    },
    getByIdAndOrgPath: {
      path: '/get/:orgPath/:id',
      method: 'GET',
      pathParams: itemIdParamsSchema.extend({
        orgPath: z.string().min(1),
        id: z.coerce.number().int().gte(0)
      }),
      responses: {
        200: itemSchema,
        401: errorMsgSchema,
        404: errorMsgSchema,
        500: errorMsgSchema
      }
    },
    getAll: {
      path: '/get-all',
      method: 'GET',
      responses: {
        200: z.array(
          z.object({
            orgId: z.number().int().gte(0),
            items: z.array(itemSchema)
          })
        ),
        500: errorMsgSchema
      }
    }
  },
  { pathPrefix: '/item' }
);
