const nextJest = require('next/jest.js');

const createJestConfig = nextJest({
  dir: './'
});

const config = {
  displayName: '@invm/web',
  preset: '../../jest.preset.ts',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // Mirrors the "paths" in tsconfig.base.json, which Jest does not read on its own
  moduleNameMapper: {
    '^@invm/inventory-db-utils$': '<rootDir>/../../packages/inventory-db-utils/src/index.ts',
    '^@invm/api-contracts/schemas$': '<rootDir>/../../packages/api-contracts/src/schemas/index.ts'
  },
  coverageDirectory: '../../coverage/apps/web',
  testEnvironment: 'jsdom'
};

const jestConfig = createJestConfig(config);

module.exports = async () => {
  const resolved = await jestConfig();
  for (const value of Object.values(resolved.transform)) {
    if (Array.isArray(value) && value[1]?.resolvedBaseUrl) {
      value[1] = { ...value[1], resolvedBaseUrl: undefined };
    }
  }
  return resolved;
};
