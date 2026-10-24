import { errorMsgSchema, itemSchema } from '@invm/api-contracts/schemas';
import { c } from '../../contract';

export const itemRouter = c.router(
  {
    createItem: {
      path: '/create',
      method: 'PUT',
      body: itemSchema.omit({ id: true }),
      responses: {
        200: itemSchema,
        500: errorMsgSchema
      }
    }
  },
  { pathPrefix: '/item' }
);
