import { c } from '../../contract';
import { z } from 'zod'; //ask about zod

export const itemsRouter = c.router(
  {
    getItems: {
      path: '/list',
      method: 'GET',
      responses: {
        200: z.array(
          z.object({
            id: z.number().gte(0),
            name: z.string().min(1)
          })
        )
      }
    }
  },
  { pathPrefix: '/items' }
);
