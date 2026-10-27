'use client';

import { createPortal } from 'react-dom';
import { Dialog, DialogContent } from './ui/dialog';
import { useOnClient } from '../hooks/useOnClient';
import { SignUpFormHandler } from './SignUpForm';
import { LogInFormHandler } from './LogInForm';
import { useAuthPopup } from '../hooks/useAuthPopup';

export function AuthPopup() {
  const onClient = useOnClient();
  const { open, setOpen, authType } = useAuthPopup();

  return onClient
    ? createPortal(
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent showCloseButton={false}>
            {authType === 'signup' ? (
              <SignUpFormHandler onClose={() => setOpen(false)} />
            ) : (
              <LogInFormHandler onClose={() => setOpen(false)} />
            )}
          </DialogContent>
        </Dialog>,
        document.body
      )
    : null;
}
