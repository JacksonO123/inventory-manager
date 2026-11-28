import { HttpError } from './errors';

describe('HttpError', () => {
  it('is an instance of Error', () => {
    const error = new HttpError(404, 'not found');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(HttpError);
  });

  it('sets the status', () => {
    expect(new HttpError(404, 'not found').status).toBe(404);
    expect(new HttpError(409, 'conflict').status).toBe(409);
  });

  it('sets the message', () => {
    expect(new HttpError(404, 'not found').message).toBe('not found');
  });

  it('sets the name to HttpError', () => {
    expect(new HttpError(404, 'not found').name).toBe('HttpError');
  });
});
