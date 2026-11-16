import { c } from '../../contract';
import { z } from 'zod';

export const reservationRouter = c.router(
  {
    addReservation: {
      path: '/add',
      method: 'PUT',
      body: z
        .object({
          orgId: z.number().int().gte(0),
          itemId: z.number().int().gte(0),
          start: z.date(),
          end: z.date()
        })
        .refine(
          (schema) => {
            return schema.start < schema.end;
          },
          { message: 'End date must be after start date' }
        ),
      responses: {
        200: c.noBody()
      }
    }
  },
  { pathPrefix: '/reservation' }
);
