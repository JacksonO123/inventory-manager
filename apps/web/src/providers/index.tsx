import { AdminContextType } from '../contexts/admin-context';
import { AdminProvider } from './AdminProvider';
import { ReactQueryProvider } from './ReactQueryProvider';

type ProvidersProps = {
  children: React.ReactNode;
  adminStatus: AdminContextType;
};

export function Providers({ children, adminStatus }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <AdminProvider adminStatus={adminStatus}>{children}</AdminProvider>
    </ReactQueryProvider>
  );
}
