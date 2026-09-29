/** @type {import('@jest/types').Config.InitialOptions} */
export default async () => ({
  displayName: '@homelab/environments',
  preset: '../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', { swcrc: false }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testEnvironment: 'node',
  coverageDirectory: '../../coverage/packages/environments'
});
