import { errorMsgSchema, itemSchema } from '@invm/api-contracts/schemas';
import { c } from '../../contract';
import { z } from 'zod';

export const itemRouter = c.router(
  {
    createItem: {
      path: '/create',
      method: 'PUT',
      body: itemSchema.omit({ id: true }),
      responses: {
        200: z.object({ id: z.number().gte(0) }),
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
