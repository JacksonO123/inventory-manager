const mockDevSecrets = {
  inventory_db: {
    host: 'localhost',
    port: '5432',
    dbName: 'inventory_db',
    username: 'dev_user',
    password: 'dev_pass'
  },
  api: { baseUrl: 'http://localhost:3000/api' },
  web: {
    betterAuthSecret: 'dev_auth_secret',
    googleClientId: 'dev_client_id',
    googleClientSecret: 'dev_client_secret',
    baseUrl: 'http://localhost:3000'
  }
};

const mockStagingSecrets = {
  inventory_db: {
    host: 'staging-host',
    port: '5433',
    dbName: 'staging_db',
    username: 'staging_user',
    password: 'staging_pass'
  },
  api: { baseUrl: 'https://staging.example.com/api' },
  web: {
    betterAuthSecret: 'staging_auth_secret',
    googleClientId: 'staging_client_id',
    googleClientSecret: 'staging_client_secret',
    baseUrl: 'https://staging.example.com'
  }
};

const mockProdSecrets = {
  inventory_db: {
    host: 'prod-host',
    port: '5432',
    dbName: 'prod_db',
    username: 'prod_user',
    password: 'prod_pass'
  },
  api: { baseUrl: 'https://prod.example.com/api' },
  web: {
    betterAuthSecret: 'prod_auth_secret',
    googleClientId: 'prod_client_id',
    googleClientSecret: 'prod_client_secret',
    baseUrl: 'https://prod.example.com'
  }
};

// The secrets files are gitignored, so mock them all to keep the test hermetic.
jest.mock('../secrets/secrets.development.json', () => mockDevSecrets, { virtual: true });
jest.mock('../secrets/secrets.staging.json', () => mockStagingSecrets, { virtual: true });
jest.mock('../secrets/secrets.production.json', () => mockProdSecrets, { virtual: true });

describe('env', () => {
  const originalEnvironment = process.env.ENVIRONMENT;

  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (originalEnvironment === undefined) {
      delete process.env.ENVIRONMENT;
    } else {
      process.env.ENVIRONMENT = originalEnvironment;
    }
    jest.restoreAllMocks();
  });

  it('loads the development secrets and exposes the environment', () => {
    process.env.ENVIRONMENT = 'development';
    const { env } = require('./env');

    expect(env).toEqual({
      ...mockDevSecrets,
      inventory_db: { ...mockDevSecrets.inventory_db, port: 5432 },
      environment: 'development'
    });
  });

  it.each(['staging', 'production'])('loads the %s secrets', (environment) => {
    process.env.ENVIRONMENT = environment;
    const { env } = require('./env');

    const secrets = environment === 'staging' ? mockStagingSecrets : mockProdSecrets;
    expect(env).toEqual({
      ...secrets,
      inventory_db: { ...secrets.inventory_db, port: Number(secrets.inventory_db.port) },
      environment
    });
  });

  it('throws when ENVIRONMENT is not a known environment', () => {
    process.env.ENVIRONMENT = 'invalid';

    expect(() => require('./env')).toThrow('Invalid environment config');
  });

  it('throws when ENVIRONMENT is missing', () => {
    delete process.env.ENVIRONMENT;

    expect(() => require('./env')).toThrow('Invalid environment config');
  });

  it('throws when the secrets fail validation', () => {
    process.env.ENVIRONMENT = 'staging';
    jest.doMock('../secrets/secrets.staging.json', () => ({ inventory_db: {} }), { virtual: true });

    expect(() => require('./env')).toThrow('Invalid environment variables');
  });
});
