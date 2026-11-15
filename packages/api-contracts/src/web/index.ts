import { c } from '../contract';
import { z } from 'zod';
import { itemRouter } from './routers';
import { adminRouter } from './routers/admin';
import { superAdminRouter } from './routers/superAdmin';
import { organizationRouter } from './routers/organization';

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
    admin: adminRouter,
    superAdmin: superAdminRouter,
    organizations: organizationRouter
  },
  { pathPrefix: '/api' }
);
