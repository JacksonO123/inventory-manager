import { initContract } from '@ts-rest/core';

type Contract = ReturnType<typeof initContract>;
export const c: Contract = initContract();
