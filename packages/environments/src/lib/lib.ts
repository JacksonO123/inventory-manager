import { z } from 'zod';
import { EnvClientServerSecretAccessError, EnvParseError } from './errors';

type EnvRuntimeDefinition = Record<string, z.ZodType>;

type MapEmptyObj<T extends EnvRuntimeDefinition> = {} extends T
  ? [T] extends [{}]
    ? Record<string, never>
    : T
  : T;

type JoinDefinitions<
  BaseClient extends EnvRuntimeDefinition,
  BaseServer extends EnvRuntimeDefinition,
  Mode extends 'basic' | 'inferred' = 'basic'
> = {
  [Key in keyof BaseClient]: Mode extends 'basic' ? any : z.infer<BaseClient[Key]>;
} & {
  [Key in keyof BaseServer]: Mode extends 'basic' ? any : z.infer<BaseServer[Key]>;
};

type UnionObjValuesWithUndefined<T extends object> = {
  [Key in keyof T]: T[Key] | undefined;
};

type RuntimeEnv<T> = [keyof T] extends [never] ? Record<string, never> : T;

type NoOverlap<C extends EnvRuntimeDefinition, S extends EnvRuntimeDefinition> = [
  Extract<keyof C, keyof S>
] extends [never]
  ? unknown
  : {
      [
        K in Extract<keyof C, keyof S>
      ]: `Error: '${K & string}' is defined in both client and server`;
    };

type ToRuntimeEnv<
  BaseClient extends EnvRuntimeDefinition,
  BaseServer extends EnvRuntimeDefinition
> = RuntimeEnv<UnionObjValuesWithUndefined<JoinDefinitions<BaseClient, BaseServer>>>;

type EnvDefinition<
  BaseClient extends EnvRuntimeDefinition,
  BaseServer extends EnvRuntimeDefinition
> = {
  client: MapEmptyObj<BaseClient> & NoOverlap<BaseClient, BaseServer>;
  server: MapEmptyObj<BaseServer> & NoOverlap<BaseClient, BaseServer>;
  runtimeEnv: ToRuntimeEnv<BaseClient, BaseServer>;
};

export function createEnv<
  BaseClient extends EnvRuntimeDefinition,
  BaseServer extends EnvRuntimeDefinition
>(envDefinition: EnvDefinition<BaseClient, BaseServer>) {
  const useClient = isClient();
  const envSchema = useClient
    ? z.object(envDefinition.client)
    : z.object(envDefinition.client).extend(envDefinition.server);
  const runtimeEnv = useClient ? filterToClientKeys(envDefinition) : envDefinition.runtimeEnv;
  const parsed = envSchema.safeParse(runtimeEnv);

  if (!parsed.success) {
    console.error(parsed.error);
    throw new EnvParseError();
  }

  return proxySecureClient(parsed.data, envDefinition.server) as JoinDefinitions<
    BaseClient,
    BaseServer,
    'inferred'
  >;
}

function proxySecureClient<
  T extends EnvRuntimeDefinition,
  K extends EnvRuntimeDefinition,
  G extends JoinDefinitions<T, K>
>(env: G, serverDefinition: EnvRuntimeDefinition) {
  const serverSecrets = new Set(Object.keys(serverDefinition));

  return new Proxy(env, {
    get(target, prop) {
      if (isClient() && serverSecrets.has(prop.toString())) {
        throw new EnvClientServerSecretAccessError();
      }
      return target[prop as keyof typeof target];
    }
  });
}

function isClient() {
  // @ts-ignore
  return typeof window !== 'undefined';
}

function filterToClientKeys<
  BaseClient extends EnvRuntimeDefinition,
  BaseServer extends EnvRuntimeDefinition
>(envDefinition: EnvDefinition<BaseClient, BaseServer>) {
  const outEnv: Record<string, unknown> = {};

  const keys = Object.keys(envDefinition.client);
  for (const key of keys) {
    outEnv[key] = envDefinition.runtimeEnv[key];
  }

  return outEnv;
}
