import { errorMsgSchema, eventSchema } from '@invm/api-contracts/schemas';
import { c } from '../../contract';
import { z } from 'zod';

export const reservationRouter = c.router(
  {
    addReservation: {
      path: '/add',
      method: 'PUT',
      body: z.object({
        orgId: z.number().int().gte(0),
        itemId: z.number().int().gte(0),
        event: eventSchema
      }),
      responses: {
        200: c.noBody(),
        500: errorMsgSchema
      }
    }
  },
  { pathPrefix: '/reservation' }
);
