import { useContext } from 'react';
import { BasicAuthContext } from '../contexts/basicAuth.ts';

export function useBasicAuth() {
  const context = useContext(BasicAuthContext);
  return context;
}
