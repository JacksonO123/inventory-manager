import { rootWebRouter } from '@invm/api-contracts/web';
import { createNextRoute, createNextRouter } from '@ts-rest/next';
import { db } from '../../server/db';
import { messageTable } from '@invm/inventory-db-utils';

const nextMessagesRoute = createNextRoute(rootWebRouter.messages, {
  getMessages: async () => {
    const messages = await db.select().from(messageTable);
    return { status: 200, body: messages };
  }
});

const router = createNextRoute(rootWebRouter, {
  debug: async () => {
    return { status: 200, body: 'success' };
  },

  messages: nextMessagesRoute
});

export default createNextRouter(rootWebRouter, router);
