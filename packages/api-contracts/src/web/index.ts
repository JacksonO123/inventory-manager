import { c } from '../contract';
import { z } from 'zod';
import {
  adminRouter,
  itemRouter,
  organizationRouter,
  reservationRouter,
  superAdminRouter
} from './routers';

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
    organizations: organizationRouter,
    reservation: reservationRouter
  },
  { pathPrefix: '/api' }
);
