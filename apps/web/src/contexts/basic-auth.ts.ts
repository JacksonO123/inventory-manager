import { createContext } from 'react';
import { BasicUser } from '../types/types';

type BasicAuthContextType = {
  basicUser: BasicUser | null;
  setBasicUser: (user: BasicUser) => void;
};

export const BasicAuthContext = createContext<BasicAuthContextType>({
  basicUser: null,
  setBasicUser: () => {}
});
