import { initTsrReactQuery } from '@ts-rest/react-query/v5';
import { rootWebRouter } from '@invm/api-contracts/web';
import { env } from '../env';
import { headers } from 'next/headers';

export async function tsrFactory() {
  const nextHeaders = await headers();
  return initTsrReactQuery(rootWebRouter, {
    baseUrl: env.API_BASE_URL,
    baseHeaders: {
      cookie: nextHeaders.get('cookie') ?? ''
    }
  });
}
