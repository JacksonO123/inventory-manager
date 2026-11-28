/** @type {import('@jest/types').Config.InitialOptions} */
export default async () => ({
  displayName: '@invm/inventory-db-utils',
  preset: '../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', { swcrc: false }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testEnvironment: 'node',
  coverageDirectory: '../../coverage/packages/inventory-db-utils'
});
