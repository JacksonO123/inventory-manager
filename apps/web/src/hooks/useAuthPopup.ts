import { redirect, usePathname } from 'next/navigation';
import { useAuthPopupStore } from '../store/authPopup';
import { AuthTypes } from '../types/types';

export function useAuthPopup() {
  const pathname = usePathname();

  const open = useAuthPopupStore((state) => state.open);
  const setOpen = useAuthPopupStore((state) => state.setOpen);

  const authType = useAuthPopupStore((state) => state.authType);
  const setAuthType = useAuthPopupStore((state) => state.setAuthType);

  function switchAuthType(newAuthType: AuthTypes) {
    if (authType === newAuthType || pathname === null) return;
    const sliced = pathname.slice(1);
    if (sliced.startsWith('signup')) {
      redirect('/login');
    } else if (sliced.startsWith('login')) {
      redirect('/signup');
    } else {
      setAuthType(newAuthType);
    }
  }

  return { open, setOpen, authType, setAuthType, switchAuthType };
}
