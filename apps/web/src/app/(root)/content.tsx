'use client';

import { Plus } from 'lucide-react';
import { authClient } from '../../client/auth-client';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button } from '../../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { useState } from 'react';
import { CreateItemForm } from './components/CreateItemForm';
import { tsr } from '../../server/tsr';
import { PartialItem } from '../../types/types';

export function Content() {
  const session = authClient.useSession();
  const [creatingItem, setCreatingItem] = useState(false);

  const saveItemMutation = tsr.item.createItem.useMutation();

  async function handleSaveItem(item: PartialItem) {
    // use result from this when making optimistic updates
    await saveItemMutation.mutateAsync({ body: item });
    setCreatingItem(false);
  }

  return (
    <main>
      <Header className="flex justify-end">
        {session.isPending ? (
          <LoadingSpinner />
        ) : session.data ? (
          <Popover>
            <PopoverTrigger
              render={
                <button className="rounded-full border flex gap-2 items-center justify-center pl-4 cursor-pointer">
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
          <Button
            onClick={() =>
              authClient.signIn.social({
                provider: 'google',
                callbackURL: '/',
                errorCallbackURL: '/auth-error'
              })
            }
          >
            Sign In
          </Button>
        )}
      </Header>
      <div className="p-8">
        {creatingItem ? (
          <CreateItemForm onSave={handleSaveItem} onCancel={() => setCreatingItem(false)} />
        ) : (
          <Button onClick={() => setCreatingItem(true)}>
            Create Item <Plus />
          </Button>
        )}
      </div>
    </main>
  );
}
