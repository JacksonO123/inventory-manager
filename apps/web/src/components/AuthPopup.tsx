'use client';

import { createPortal } from 'react-dom';
import { Dialog, DialogContent } from './ui/dialog';
import { useOnClient } from '../hooks/useOnClient';
import { AuthTypes } from '../types/types';
import { SignUpFormHandler } from './SignUpForm';
import { LogInFormHandler } from './LogInForm';

type AuthPopupProps = {
  open: boolean;
  authType: AuthTypes;
  onOpenChange: (open: boolean) => void;
};

export function AuthPopup({ open, onOpenChange, authType }: AuthPopupProps) {
  const onClient = useOnClient();

  return onClient
    ? createPortal(
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent showCloseButton={false}>
            {authType === 'signup' ? (
              <SignUpFormHandler onClose={() => onOpenChange(false)} />
            ) : (
              <LogInFormHandler onClose={() => onOpenChange(false)} />
            )}
          </DialogContent>
        </Dialog>,
        document.body
      )
    : null;
}
