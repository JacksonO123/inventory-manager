import { errorMsgSchema, itemSchema, partialItemSchema } from '@invm/api-contracts/schemas';
import { c } from '../../contract';
import { z } from 'zod';

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
    }
  },
  { pathPrefix: '/item' }
);
