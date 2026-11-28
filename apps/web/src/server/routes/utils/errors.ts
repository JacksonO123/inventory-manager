import { HttpError } from '../../errors';

function messageWithCause(message: string, cause?: unknown) {
  return cause === undefined ? message : `${message} (cause: ${cause})`;
}

export function errorResponse(err: unknown) {
  if (err instanceof HttpError) {
    return {
      status: err.status,
      body: { message: messageWithCause(err.message, err.cause) }
    } as const;
  } else if (err instanceof Error) {
    return {
      status: 500,
      body: { message: messageWithCause(err.message, err.cause) }
    } as const;
  }
  return { status: 500, body: { message: err + '' } } as const;
}
