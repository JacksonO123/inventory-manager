import { useContext } from 'react';
import { basicAuthContext } from '../contexts/basicAuth';

export function useBasicAuth() {
  const context = useContext(basicAuthContext);
  if (!context) {
    throw new Error('Expected to be in basic auth context');
  }
  return context;
}
