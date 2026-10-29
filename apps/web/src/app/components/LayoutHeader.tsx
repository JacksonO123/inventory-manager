'use client';

import { Popover, PopoverTrigger } from '../../components/ui/popover';
import { Header } from '../../components/Header';
import { PopoverContent } from '../../components/ui/popover';
import { authClient } from '../../client/auth-client';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from 'cn';
import { tsr } from '../../server/tsr';

export function LayoutHeader() {
  const pathname = usePathname();
  const session = authClient.useSession();
  const userId = session.data?.user.id;
  const { data: isSuperAdmin } = tsr.superAdmin.isSuperAdmin.useQuery({
    queryKey: ['is_super_admin', userId],
    queryData: { query: { id: userId! } },
    enabled: !!userId
  });

  return (
    <Header className="flex justify-between h-16 items-center">
      <h1 className="text-lg">Inventory Manager</h1>
      <div className="flex gap-6 items-center text-md">
        {isSuperAdmin?.status === 200 && isSuperAdmin.body.isAdmin === true && (
          <Link
            href="/super-admin"
            className={cn(
              'cursor-pointer underline',
              pathname?.startsWith('/super-admin') && 'text-primary'
            )}
          >
            Admin Panel
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
