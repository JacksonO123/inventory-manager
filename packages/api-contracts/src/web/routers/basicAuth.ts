import {
  basicUserSchema,
  basicUserSchemaOmitId,
  errorMsgSchema
} from '@invm/api-contracts/schemas';
import { c } from '../../contract';
import { z } from 'zod';

export const basicAuthRouter = c.router(
  {
    getUser: {
      path: '/get',
      method: 'GET',
      query: z.object({
        email: z.email()
      }),
      responses: {
        200: z.object({
          user: basicUserSchema.nullable()
        }),
        500: errorMsgSchema
      }
    },
    createUser: {
      path: '/create-or-get',
      method: 'POST',
      body: basicUserSchemaOmitId,
      responses: {
        200: z.object({
          id: z.number().gte(0)
        }),
        500: errorMsgSchema
      }
    }
  },
  { pathPrefix: '/auth' }
);
