import fs from 'fs';
import path from 'path';
import { appEnvContents } from '../conf/contents';
import { EnvParseError } from './errors';

for (const value of Object.values(appEnvContents)) {
  const basePath = path.resolve(import.meta.dirname, '../../../..');
  const envPath = path.join(basePath, value.dir, '.env');

  let env = '';

  const parsed = value.validator.safeParse(value.envVars);
  if (!parsed.success) throw new EnvParseError();

  const envVarEntries = Object.entries(parsed.data);
  for (const [envVarKey, envVarValue] of envVarEntries) {
    env += `${envVarKey}=${envVarValue}\n`;
  }

  fs.writeFileSync(envPath, env);
}
