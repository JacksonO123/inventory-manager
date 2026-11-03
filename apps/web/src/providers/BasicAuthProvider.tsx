'use client';

import { basicAuthContext } from '../contexts/basicAuth';
import { BasicUser } from '../types/types';
import { useLocalStorage } from '@mantine/hooks';

type BasicAuthProvider = {
  children: React.ReactNode | React.ReactNode[];
};

export function BasicAuthProvider({ children }: BasicAuthProvider) {
  const [basicUser, setBasicUser] = useLocalStorage<BasicUser | null>({
    key: 'basic-auth-user',
    defaultValue: null
  });

  function handleSetBasicUser(user: BasicUser) {
    setBasicUser(user);
  }

  function handleSignOut() {
    setBasicUser(null);
  }

  return (
    <basicAuthContext.Provider
      value={{ basicUser, setBasicUser: handleSetBasicUser, signOut: handleSignOut }}
    >
      {children}
    </basicAuthContext.Provider>
  );
}
