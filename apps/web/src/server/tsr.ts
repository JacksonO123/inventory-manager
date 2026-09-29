import { initTsrReactQuery } from '@ts-rest/react-query/v5';
import { rootWebRouter } from '@invm/api-contracts/web';
import { env } from '../env';

export const tsr = initTsrReactQuery(rootWebRouter, {
  baseUrl: env.API_BASE_URL
});
