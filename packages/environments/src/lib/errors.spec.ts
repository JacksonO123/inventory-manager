import { EnvParseError, EnvClientServerSecretAccessError } from './errors';

describe('EnvParseError', () => {
  it('is an Error with the parse message', () => {
    const err = new EnvParseError();

    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('[ERROR] (ENV parser): failed to parse .env file contents');
  });
});

describe('EnvClientServerSecretAccessError', () => {
  it('is an Error with the access message', () => {
    const err = new EnvClientServerSecretAccessError();

    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('[ERROR] (ENV access): server secret accessed on client');
  });
});
