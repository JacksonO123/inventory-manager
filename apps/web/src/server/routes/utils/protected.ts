import { errorMsgSchema } from '@invm/api-contracts/schemas';
import { z } from 'zod';
import { env } from '../../../env';
import { IncomingHttpHeaders } from 'http';

export function getProtectedError(headers: IncomingHttpHeaders): {
  status: 401;
  body: z.infer<typeof errorMsgSchema>;
} | null {
  if (headers.authorization === undefined || headers.authorization !== env.SERVER_PROTECTED_KEY) {
    return { status: 401, body: { message: '401 unauthorized' } };
  }
  return null;
}
