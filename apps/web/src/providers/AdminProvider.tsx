'use client';

import { adminContext, AdminContextType } from '../contexts/admin-context';

type AdminProviderProps = {
  children: React.ReactNode;
  adminStatus: AdminContextType;
};

export function AdminProvider({ children, adminStatus }: AdminProviderProps) {
  return <adminContext.Provider value={adminStatus}>{children}</adminContext.Provider>;
}
