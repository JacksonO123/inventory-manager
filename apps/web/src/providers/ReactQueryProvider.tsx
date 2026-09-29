'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { tsr } from '../server/tsr';

type ReactQueryProps = {
  children: React.ReactNode | React.ReactNode[];
};

const queryClient = new QueryClient();

export function ReactQueryProvider({ children }: ReactQueryProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <tsr.ReactQueryProvider>{children}</tsr.ReactQueryProvider>
    </QueryClientProvider>
  );
}
