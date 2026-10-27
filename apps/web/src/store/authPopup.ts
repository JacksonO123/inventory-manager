import { create } from 'zustand';
import { AuthTypes } from '../types/types';

type AuthPopupState = {
  open: boolean;
  authType: AuthTypes;
};

type AuthPopupAction = {
  setOpen: (open: boolean) => void;
  setAuthType: (authType: AuthTypes) => void;
};

export const useAuthPopupStore = create<AuthPopupState & AuthPopupAction>((set) => ({
  open: false,
  authType: 'signup',
  setOpen: (open) => set({ open }),
  setAuthType: (authType) => set({ authType })
}));
