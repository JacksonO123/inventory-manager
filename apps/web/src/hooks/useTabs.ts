import { useContext } from 'react';
import { tabsContext } from '../contexts/tabs';

export function useTabs() {
  const context = useContext(tabsContext);
  if (!context) {
    throw new Error('Expected to be in tabs context');
  }
  return context;
}
