'use client';

import { Plus } from 'lucide-react';
import { Header } from '../../components/Header';
import { Button } from '../../components/ui/button';
import { useState } from 'react';
import { CreateItemForm } from './components/CreateItemForm';
import { tsr } from '../../server/tsr';
import { Item as ItemType, PartialItem } from '../../types/types';
import { Items } from './components/Items';
import { useBasicAuth } from '../../hooks/useBasicAuth';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { useAuthPopup } from '../../hooks/useAuthPopup';
import { AuthPopup } from '../../components/AuthPopup';
import { toast } from '../../components/ui/toast';

type ContentProps = {
  items: ItemType[];
};

export function Content({ items: itemsFromServer }: ContentProps) {
  const session = useBasicAuth();
  const { setOpen: setAuthOpen, setAuthType } = useAuthPopup();
  const [creatingItem, setCreatingItem] = useState(false);
  const [items, setItems] = useState([...itemsFromServer]);

  async function handleSaveItem(item: PartialItem) {
    try {
      const fullItem: ItemType = { ...item, id: -1, status: 'available' };
      setItems((prev) => [...prev, fullItem]);
      setCreatingItem(false);
      const res = await tsr.item.createItem.mutate({ body: item });
      if (res.status === 200) {
        setItems((items) =>
          items.map((item) =>
            item.id === -1 ? { ...item, id: res.body.id, status: res.body.status } : item
          )
        );
      } else if (res.status === 500) {
        toast.add({
          type: 'error',
          title: res.body.message
        });
      }
    } catch {
      setItems((items) => items.filter((item) => item.id !== -1));
    }
  }

  return (
    <main>
      <AuthPopup />
      <Header className="flex justify-between">
        <h1 className="text-lg">Inventory Manager</h1>
        {session.basicUser ? (
          <Popover>
            <PopoverTrigger
              render={
                <button className="rounded-xl border flex items-end justify-center cursor-pointer flex-col px-1.5 py-1 bg-white">
                  <span className="leading-5">{session.basicUser.name}</span>
                  <span className="leading-5">{session.basicUser.email}</span>
                </button>
              }
            />
            <PopoverContent align="end">
              <Button onClick={() => session.signOut()}>Sign out</Button>
            </PopoverContent>
          </Popover>
        ) : (
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setAuthType('login');
                setAuthOpen(true);
              }}
            >
              Log In
            </Button>
            <Button
              onClick={() => {
                setAuthType('signup');
                setAuthOpen(true);
              }}
            >
              Sign Up
            </Button>
          </div>
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
    </main>
  );
}
