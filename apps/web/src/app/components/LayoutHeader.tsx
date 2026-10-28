'use client';

import { Popover, PopoverTrigger } from '../../components/ui/popover';
import { Header } from '../../components/Header';
import { PopoverContent } from '../../components/ui/popover';
import { authClient } from '../../client/auth-client';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export function LayoutHeader() {
  const session = authClient.useSession();

  return (
    <Header className="flex justify-between">
      <h1 className="text-lg">Inventory Manager</h1>
      {session.isPending ? (
        <LoadingSpinner />
      ) : session.data ? (
        <Popover>
          <PopoverTrigger
            render={
              <button className="rounded-full border flex items-center cursor-pointer bg-white pl-3 gap-2">
                <span>{session.data.user.email}</span>
                {session.data.user.image && (
                  <img src={session.data.user.image} className="size-8 rounded-full" />
                )}
              </button>
            }
          />
          <PopoverContent align="end">
            <Button onClick={() => authClient.signOut()}>Sign out</Button>
          </PopoverContent>
        </Popover>
      ) : (
        <div className="flex gap-4">
          <Button onClick={() => authClient.signIn.social({ provider: 'google' })}>Log In</Button>
        </div>
      )}
    </Header>
  );
}
