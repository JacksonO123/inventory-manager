'use client';

import { useState } from 'react';
import { basicAuthContext } from '../contexts/basicAuth';
import { BasicUser } from '../types/types';

type BasicAuthProvider = {
  children: React.ReactNode | React.ReactNode[];
};

export function BasicAuthProvider({ children }: BasicAuthProvider) {
  const [basicUser, setBasicUser] = useState<BasicUser | null>(null);

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
