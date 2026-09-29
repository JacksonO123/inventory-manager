import { c } from '../contract';
import { z } from 'zod';

export * from './routers';

export const rootWebRouter = c.router(
  {
    status: {
      path: '/debug',
      method: 'GET',
      responses: {
        200: z.literal('success')
      }
    }
  },
  { pathPrefix: '/web' }
);
