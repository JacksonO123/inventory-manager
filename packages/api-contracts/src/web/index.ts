import { c } from '../contract';
import { z } from 'zod';
import { basicAuthRouter, itemRouter } from './routers';

export const rootWebRouter = c.router(
  {
    debug: {
      path: '/debug',
      method: 'GET',
      responses: {
        200: z.literal('success')
      }
    },

    item: itemRouter,
    auth: basicAuthRouter
  },
  { pathPrefix: '/api' }
);
