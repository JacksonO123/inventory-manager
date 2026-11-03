/**
 * @jest-environment node
 */
import { errorResponse } from './errors';
import { HttpError } from '../../errors';

describe('errorResponse', () => {
  it('uses the status and message of a 404 HttpError', () => {
    expect(errorResponse(new HttpError(404, 'Item not found'))).toEqual({
      status: 404,
      body: { message: 'Item not found' }
    });
  });

  it('uses the status and message of a 409 HttpError', () => {
    expect(errorResponse(new HttpError(409, 'Item is not available'))).toEqual({
      status: 409,
      body: { message: 'Item is not available' }
    });
  });

  it('returns 500 for a regular Error', () => {
    expect(errorResponse(new Error('db down'))).toEqual({
      status: 500,
      body: { message: 'Error: db down' }
    });
  });

  it('returns 500 for a custom error that is not an HttpError', () => {
    class CustomError extends Error {
      status = 404;
    }

    expect(errorResponse(new CustomError('custom'))).toEqual({
      status: 500,
      body: { message: 'Error: custom' }
    });
  });

  it('returns 500 for an unknown thrown value like a string', () => {
    expect(errorResponse('something broke')).toEqual({
      status: 500,
      body: { message: 'something broke' }
    });
  });

  it('returns 500 for an unknown thrown value like undefined', () => {
    expect(errorResponse(undefined)).toEqual({
      status: 500,
      body: { message: 'undefined' }
    });
  });
});
