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
import { Item as ItemType, PartialItem } from '../../types/types';
import { Items } from './components/Items';

type ContentProps = {
  items: ItemType[];
};

export function Content({ items: itemsFromServer }: ContentProps) {
  const session = authClient.useSession();
  const [creatingItem, setCreatingItem] = useState(false);
  const [items, setItems] = useState([...itemsFromServer]);

  const saveItemMutation = tsr.item.createItem.useMutation();

  async function handleSaveItem(item: PartialItem) {
    try {
      const fullItem: ItemType = { ...item, id: -1 };
      setItems((prev) => [...prev, fullItem]);
      setCreatingItem(false);
      const res = await saveItemMutation.mutateAsync({ body: item });
      setItems((items) =>
        items.map((item) => (item.id === -1 ? { ...item, id: res.body.id } : item))
      );
    } catch {
      setItems((items) => items.filter((item) => item.id !== -1));
    }
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
      <div className="p-8 flex flex-col gap-4">
        {creatingItem ? (
          <CreateItemForm onSave={handleSaveItem} onCancel={() => setCreatingItem(false)} />
        ) : (
          <Button onClick={() => setCreatingItem(true)} className="w-fit">
            Create Item <Plus />
          </Button>
        )}
        <Items items={items} />
      </div>
      <Items items={items} />
    </main>
  );
}
