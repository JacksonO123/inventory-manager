'use client';

import { Popover, PopoverTrigger } from '../../components/ui/popover';
import { Header } from '../../components/Header';
import { PopoverContent } from '../../components/ui/popover';
import { authClient } from '../../client/auth-client';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { tsr } from '../../server/tsr';
import Link from 'next/link';

export function LayoutHeader() {
  const session = authClient.useSession();
  const userId = session.data?.user.id;
  const { data } = tsr.superAdmin.isSuperAdmin.useQuery({
    queryKey: ['is_super_admin', userId],
    enabled: !!userId,
    queryData: {
      query: {
        id: userId as string
      }
    }
  });

  return (
    <Header className="flex justify-between h-16 items-center">
      <h1 className="text-lg">Inventory Manager</h1>
      <div>
        {data?.body.isAdmin && (
          <Link href="/super-admin" className="cursor-pointer">
            Admin panel
          </Link>
        )}
        {session.isPending ? (
          <LoadingSpinner className="size-6" />
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
    </Header>
  );
}
