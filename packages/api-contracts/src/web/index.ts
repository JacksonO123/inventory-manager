import { c } from '../contract';
import { z } from 'zod';
import { basicAuthRouter, itemRouter } from './routers';
import { adminRouter } from './routers/admin';
import { superAdminRouter } from './routers/superAdmin';

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
    auth: basicAuthRouter,
    admin: adminRouter,
    superAdmin: superAdminRouter
  },
  { pathPrefix: '/api' }
);
