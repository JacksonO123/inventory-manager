import { c } from '../contract';
import { z } from 'zod';
import { itemRouter } from './routers';

export const rootWebRouter = c.router({
  debug: {
    path: '/debug',
    method: 'GET',
    responses: {
      200: z.literal('success')
    }
  },

  item: itemRouter
});
