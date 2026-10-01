import { EnvContents } from './types';

export function createEnvWithValidator<T extends z.ZodObject>(
  validator: T,
  contents: Omit<EnvContents<T>, 'validator'>
) {
  return {
    validator,
    ...contents
  };
}
