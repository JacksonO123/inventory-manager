import { rootWebRouter } from '@homelab/api-contracts/web';
import { createNextRoute, createNextRouter } from '@ts-rest/next';

const router = createNextRoute(rootWebRouter, {
  debug: async () => {
    return { status: 200, body: 'success' };
  }
});

export default createNextRouter(rootWebRouter, router);
