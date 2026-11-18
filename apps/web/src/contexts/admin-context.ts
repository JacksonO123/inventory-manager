import { createContext } from 'react';

export type AdminContextType = {
  admin: boolean;
  superAdmin: boolean;
};

export const adminContext = createContext<AdminContextType>({
  admin: false,
  superAdmin: false
});
