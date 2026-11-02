import { errorMsgSchema, itemSchema, partialItemSchema } from '@invm/api-contracts/schemas';
import { c } from '../../contract';
import { z } from 'zod';

const itemIdParamsSchema = z.object({ id: z.coerce.number().int().gte(0) });
const borrowerBodySchema = z.object({ borrowerId: z.number().int().gte(0) });

export const itemRouter = c.router(
  {
    createItem: {
      path: '/create',
      method: 'PUT',
      body: partialItemSchema,
      responses: {
        200: z.object({ id: z.number().gte(0), status: itemSchema.shape.status }),
        500: errorMsgSchema
      }
    },
    getItems: {
      path: '/list',
      method: 'GET',
      responses: {
        200: z.array(itemSchema),
        500: errorMsgSchema
      }
    },
    checkOut: {
      path: '/checkout/:id',
      method: 'POST',
      pathParams: itemIdParamsSchema,
      body: borrowerBodySchema,
      responses: {
        200: z.object({ id: z.number().gte(0) }),
        404: errorMsgSchema,
        409: errorMsgSchema,
        500: errorMsgSchema
      }
    },
    returnItem: {
      path: '/return/:id',
      method: 'POST',
      pathParams: itemIdParamsSchema,
      body: borrowerBodySchema,
      responses: {
        200: z.object({ id: z.number().gte(0) }),
        404: errorMsgSchema,
        409: errorMsgSchema,
        500: errorMsgSchema
      }
    }
  },
  { pathPrefix: '/item' }
);
