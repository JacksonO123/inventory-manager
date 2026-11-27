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
    getWithOrgPath: {
      path: '/get-by-org/:orgPath',
      method: 'GET',
      pathParams: z.object({
        orgPath: z.string().min(1)
      }),
      responses: {
        200: z.array(reservationSchema),
        401: errorMsgSchema,
        500: errorMsgSchema
      }
    },
    getWithOrgIdBetweenDates: {
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
    accept: {
      path: '/accept',
      method: 'POST',
      body: z.object({
        itemId: z.number().int().gte(0),
        reservationId: z.number().int().gte(0)
      }),
      responses: {
        200: z.object({}),
        401: errorMsgSchema,
        404: errorMsgSchema,
        500: errorMsgSchema
      }
    },
    reject: {
      path: '/reject',
      method: 'POST',
      body: z.object({
        itemId: z.number().int().gte(0),
        reservationId: z.number().int().gte(0)
      }),
      responses: {
        200: z.object({}),
        401: errorMsgSchema,
        404: errorMsgSchema,
        500: errorMsgSchema
      }
    }
  },
  { pathPrefix: '/reservation' }
);
