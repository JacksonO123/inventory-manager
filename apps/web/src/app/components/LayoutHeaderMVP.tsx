'use client';

import { Popover, PopoverTrigger } from '../../components/ui/popover';
import { Header } from '../../components/Header';
import { PopoverContent } from '../../components/ui/popover';
import { Button } from '../../components/ui/button';
import { useBasicAuth } from '../../hooks/useBasicAuth';
import { useAuthPopup } from '../../hooks/useAuthPopup';
import { User } from 'lucide-react';

export function LayoutHeaderMVP() {
  const { basicUser, signOut } = useBasicAuth();
  const { setOpen, setAuthType } = useAuthPopup();

  return (
    <Header className="flex justify-between h-16 items-center">
      <h1 className="text-lg">Inventory Manager</h1>
      <div className="flex gap-6 items-center text-md">
        {basicUser === null ? (
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setAuthType('login');
                setOpen(true);
              }}
            >
              Log In
            </Button>
            <Button
              onClick={() => {
                setAuthType('signup');
                setOpen(true);
              }}
            >
              Sign Up
            </Button>
          </div>
        ) : (
          <Popover>
            <PopoverTrigger
              render={
                <button className="rounded-full border flex items-center cursor-pointer bg-white pl-3 gap-2">
                  <span>{basicUser.email}</span>
                  <div className="rounded-full bg-neutral-200 h-8 w-8 flex justify-center items-center">
                    <User className="size-5" />
                  </div>
                </button>
              }
            />
            <PopoverContent align="end">
              <Button onClick={signOut}>Sign out</Button>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </Header>
  );
}
