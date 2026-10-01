import { c } from '../contract';
import { z } from 'zod';
import { messagesRouter } from './routers/messages';

export const rootWebRouter = c.router({
  debug: {
    path: '/debug',
    method: 'GET',
    responses: {
      200: z.literal('success')
    }
  },

  messages: messagesRouter
});
