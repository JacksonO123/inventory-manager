'use client';

import { Popover, PopoverTrigger } from './ui/popover';
import { PopoverContent } from './ui/popover';
import { authClient } from '../client/auth-client';
import { Button } from './ui/button';
import { LoadingSpinner } from './LoadingSpinner';
import Link from 'next/link';
import { useAdmin } from '../hooks/use-admin';
import { Badge } from './ui/badge';

export function PageHeader() {
  const session = authClient.useSession();
  const { admin, superAdmin } = useAdmin();

  return (
    <header className="flex justify-between h-16 items-center border-b">
      <Link href="/" className="h-full flex items-center px-4">
        <h1 className="text-lg text-nowrap">Inventory Manager</h1>
      </Link>
      <div className="flex gap-6 items-center text-md p-4">
        {superAdmin ? (
          <Badge className="p-3" variant="outline">
            Super Admin
          </Badge>
        ) : admin ? (
          <Badge className="p-3" variant="outline">
            Admin
          </Badge>
        ) : (
          <></>
        )}
        {session.isPending ? (
          <LoadingSpinner className="size-8" />
        ) : session.data ? (
          <Popover>
            <PopoverTrigger
              render={
                <button className="rounded-full border flex items-center cursor-pointer bg-white pl-3 gap-2">
                  <span>{session.data.user.email}</span>
                  {session.data.user.image && (
                    <img src={session.data.user.image} className="rounded-full aspect-square h-8" />
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
      </div>
    </header>
  );
}
