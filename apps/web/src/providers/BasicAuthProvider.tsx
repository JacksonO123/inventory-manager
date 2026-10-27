'use client';

import { useState } from 'react';
import { BasicAuthContext } from '../contexts/basicAuth.ts';
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
    <BasicAuthContext.Provider
      value={{ basicUser, setBasicUser: handleSetBasicUser, signOut: handleSignOut }}
    >
      {children}
    </BasicAuthContext.Provider>
  );
}
