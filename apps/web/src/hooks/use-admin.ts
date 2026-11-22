import { useContext } from 'react';
import { adminContext } from '../contexts/admin-context';

export function useAdmin() {
  const context = useContext(adminContext);
  if (context === undefined) {
    throw new Error('Expected to be in admin context');
  }
  return context;
}
