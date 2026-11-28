import { errorResponse } from './errors';
import { HttpError } from '../../errors';

describe('errorResponse', () => {
  it('maps an HttpError to its status with a message including the cause', () => {
    const err = new HttpError(404, 'Item not found');
    (err as Error & { cause?: unknown }).cause = 'db lookup';

    expect(errorResponse(err)).toEqual({
      status: 404,
      body: { message: 'Item not found (cause: db lookup)' }
    });
  });

  it('maps a plain Error to a 500 response with a message including the cause', () => {
    const err = new Error('boom');
    (err as Error & { cause?: unknown }).cause = 'underlying';

    expect(errorResponse(err)).toEqual({
      status: 500,
      body: { message: 'boom (cause: underlying)' }
    });
  });

  it('omits the cause when the error has no cause', () => {
    expect(errorResponse(new HttpError(409, 'conflict')).body.message).toBe('conflict');
    expect(errorResponse(new Error('boom')).body.message).toBe('boom');
  });

  it('maps a non-error value to a 500 response stringified', () => {
    expect(errorResponse('string error')).toEqual({
      status: 500,
      body: { message: 'string error' }
    });

    expect(errorResponse(42)).toEqual({
      status: 500,
      body: { message: '42' }
    });
  });
});
