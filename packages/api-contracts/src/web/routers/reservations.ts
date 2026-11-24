import {
  errorMsgSchema,
  reservationSchema,
  partialReservationSchema,
  unrefinedReservationSchema
} from '@invm/api-contracts/schemas';
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
        event: partialReservationSchema.extend({ status: unrefinedReservationSchema.shape.status }),
        borrowerId: z.string().min(1)
      }),
      responses: {
        200: z.object({
          id: z.string().min(1)
        }),
        500: errorMsgSchema,
        401: errorMsgSchema,
        409: errorMsgSchema
      }
    },
    getByItemIdAndOrgPath: {
      path: '/get/:orgPath/:itemId',
      method: 'GET',
      pathParams: z.object({
        orgPath: z.string().min(1),
        itemId: z.coerce.number().int().gte(0)
      }),
      responses: {
        200: z.array(reservationSchema),
        500: errorMsgSchema,
        401: errorMsgSchema
      }
    },
    getByItemIdAndOrgPathBetweenDates: {
      path: '/get-by-item-between-dates/:orgId/:itemId',
      method: 'POST',
      pathParams: z.object({
        orgId: z.coerce.number().int().gte(0),
        itemId: z.coerce.number().int().gte(0)
      }),
      body: z.object({
        start: z.coerce.date(),
        end: z.coerce.date()
      }),
      responses: {
        200: z.array(reservationSchema),
        401: errorMsgSchema,
        500: errorMsgSchema
      }
    },
    getOrgIdBetweenDates: {
      path: '/get-between-dates/:orgId',
      method: 'POST',
      pathParams: z.object({
        orgId: z.coerce.number().int().gte(0)
      }),
      body: z.object({
        start: z.coerce.date(),
        end: z.coerce.date()
      }),
      responses: {
        200: z.array(reservationSchema),
        401: errorMsgSchema,
        500: errorMsgSchema
      }
    },
    getReservationRequestsForOrg: {
      path: '/get-requests/:orgPath',
      method: 'GET',
      pathParams: z.object({
        orgPath: z.string().min(1)
      }),
      responses: {
        200: z.array(
          z.object({
            itemId: z.number().int().gte(0),
            reservations: z.array(reservationSchema.extend({ borrowerName: z.string() }))
          })
        ),
        401: errorMsgSchema,
        500: errorMsgSchema
      }
    }
  },
  { pathPrefix: '/reservation' }
);
