import { HttpError } from '../../errors';

export function errorResponse(err: unknown) {
  if (err instanceof HttpError) {
    return { status: err.status, body: { message: err.message } } as const;
  }
  return { status: 500, body: { message: err + '' } } as const;
}
