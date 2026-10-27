import { BasicAuthProvider } from './BasicAuthProvider';
import { ReactQueryProvider } from './ReactQueryProvider';

type ProvidersProps = {
  children: React.ReactNode | React.ReactNode[];
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <BasicAuthProvider>{children}</BasicAuthProvider>
    </ReactQueryProvider>
  );
}
