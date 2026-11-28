import { z } from 'zod';
import { createEnvWithValidator } from './utils';

describe('createEnvWithValidator', () => {
  it('returns the validator with the env contents', () => {
    const validator = z.object({ A: z.string() });
    const contents = { dir: 'apps/web', envVars: { A: 'value' } };

    expect(createEnvWithValidator(validator, contents)).toEqual({
      validator,
      dir: 'apps/web',
      envVars: { A: 'value' }
    });
  });
});
