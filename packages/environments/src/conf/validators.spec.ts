import { webValidator } from './validators';

const validEnvVars = {
  NEXT_PUBLIC_ENVIRONMENT: 'development',
  NEXT_PUBLIC_API_BASE_URL: 'http://localhost:3000/api',
  NEXT_PUBLIC_WEB_BASE_URL: 'http://localhost:3000',
  INVENTORY_DB_USERNAME: 'user',
  INVENTORY_DB_PASSWORD: 'pass',
  INVENTORY_DB_HOST: 'localhost',
  INVENTORY_DB_PORT: 5432,
  INVENTORY_DB_NAME: 'inventory_db',
  BETTER_AUTH_SECRET: 'secret',
  GOOGLE_CLIENT_ID: 'client-id',
  GOOGLE_CLIENT_SECRET: 'client-secret'
};

describe('webValidator', () => {
  it('parses valid env vars', () => {
    expect(webValidator.parse(validEnvVars)).toEqual(validEnvVars);
  });

  it.each(['development', 'staging', 'production'])('accepts environment %s', (environment) => {
    expect(webValidator.safeParse({ ...validEnvVars, NEXT_PUBLIC_ENVIRONMENT: environment }).success).toBe(true);
  });

  it('rejects an unknown environment', () => {
    expect(webValidator.safeParse({ ...validEnvVars, NEXT_PUBLIC_ENVIRONMENT: 'invalid' }).success).toBe(false);
  });

  it('rejects an invalid URL', () => {
    expect(webValidator.safeParse({ ...validEnvVars, NEXT_PUBLIC_API_BASE_URL: 'not a url' }).success).toBe(false);
  });

  it('rejects a negative port', () => {
    expect(webValidator.safeParse({ ...validEnvVars, INVENTORY_DB_PORT: -1 }).success).toBe(false);
  });

  it('rejects an empty secret', () => {
    expect(webValidator.safeParse({ ...validEnvVars, BETTER_AUTH_SECRET: '' }).success).toBe(false);
  });
});
