import { c } from '../../contract';
import { z } from 'zod';

export const messagesRouter = c.router(
  {
    getMessages: {
      path: '/list',
      method: 'GET',
      responses: {
        200: z.array(
          z.object({
            id: z.number().gte(0),
            message: z.string().min(1)
          })
        )
      }
    }
  },
  { pathPrefix: '/messages' }
);
