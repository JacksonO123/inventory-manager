import { useState } from 'react';
import { BasicAuthContext } from '../contexts/basic-auth.ts';
import { BasicUser } from '../types/types';

type BasicAuthProvider = {
  children: React.ReactNode | React.ReactNode[];
};

export function BasicAuthProvider({ children }: BasicAuthProvider) {
  const [basicUser, setBasicUser] = useState<BasicUser | null>(null);

  function handleSetBasicUser(user: BasicUser) {
    setBasicUser(user);
  }

  return (
    <BasicAuthContext.Provider value={{ basicUser, setBasicUser: handleSetBasicUser }}>
      {children}
    </BasicAuthContext.Provider>
  );
}
