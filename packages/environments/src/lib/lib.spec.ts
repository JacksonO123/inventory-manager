import { z } from 'zod';
import { createEnv } from './lib';
import { EnvParseError, EnvClientServerSecretAccessError } from './errors';

const clientDef = {
  PUBLIC_URL: z.string().url(),
  MODE: z.enum(['development', 'production'])
};
const serverDef = {
  DB_PASSWORD: z.string().min(1),
  API_KEY: z.string().min(1)
};
const runtimeEnv = {
  PUBLIC_URL: 'https://example.com',
  MODE: 'development',
  DB_PASSWORD: 'secret',
  API_KEY: 'key'
};

describe('createEnv', () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).window;
  });

  describe('server mode', () => {
    it('parses client and server values from the runtime env', () => {
      const env = createEnv({ client: clientDef, server: serverDef, runtimeEnv });

      expect(env.PUBLIC_URL).toBe('https://example.com');
      expect(env.MODE).toBe('development');
      expect(env.DB_PASSWORD).toBe('secret');
      expect(env.API_KEY).toBe('key');
    });

    it('allows reading server secrets', () => {
      const env = createEnv({ client: clientDef, server: serverDef, runtimeEnv });

      expect(() => env.DB_PASSWORD).not.toThrow();
      expect(env.DB_PASSWORD).toBe('secret');
    });
  });

  describe('client mode', () => {
    beforeEach(() => {
      (globalThis as Record<string, unknown>).window = {};
    });

    it('parses the client values', () => {
      const env = createEnv({ client: clientDef, server: serverDef, runtimeEnv });

      expect(env.PUBLIC_URL).toBe('https://example.com');
      expect(env.MODE).toBe('development');
    });

    it('does not require server keys in the runtime env', () => {
      const env = createEnv({
        client: clientDef,
        server: serverDef,
        runtimeEnv: { PUBLIC_URL: 'https://example.com', MODE: 'production' }
      });

      expect(env.PUBLIC_URL).toBe('https://example.com');
      expect(env.MODE).toBe('production');
    });

    it('throws when a server secret is accessed', () => {
      const env = createEnv({ client: clientDef, server: serverDef, runtimeEnv });

      expect(() => env.DB_PASSWORD).toThrow(EnvClientServerSecretAccessError);
      expect(() => env.API_KEY).toThrow(EnvClientServerSecretAccessError);
    });
  });

  describe('validation', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('throws EnvParseError when a value fails its validator', () => {
      expect(() =>
        createEnv({
          client: clientDef,
          server: serverDef,
          runtimeEnv: {
            PUBLIC_URL: 'not a url',
            MODE: 'development',
            DB_PASSWORD: 'secret',
            API_KEY: 'key'
          }
        })
      ).toThrow(EnvParseError);
    });

    it('throws EnvParseError when a required server key is missing in server mode', () => {
      expect(() =>
        createEnv({
          client: clientDef,
          server: serverDef,
          runtimeEnv: { PUBLIC_URL: 'https://example.com', MODE: 'development', DB_PASSWORD: 'secret' }
        })
      ).toThrow(EnvParseError);
    });
  });

  it('supports an empty client definition', () => {
    const env = createEnv({
      client: {},
      server: serverDef,
      runtimeEnv: { DB_PASSWORD: 'secret', API_KEY: 'key' }
    });

    expect(env.DB_PASSWORD).toBe('secret');
    expect(env.API_KEY).toBe('key');
  });
});
