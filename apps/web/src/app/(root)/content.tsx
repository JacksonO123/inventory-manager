'use client';

import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useState } from 'react';
import { CreateItemForm } from './components/CreateItemForm';
import { tsr } from '../../server/tsr';
import { ItemAndBasicUserBorrower, Item as ItemType, PartialItem } from '../../types/types';
import { Items } from './components/Items';
import { toast } from '../../components/ui/toast';
import { authClient } from '../../client/auth-client';

type ContentProps = {
  items: ItemAndBasicUserBorrower[];
};

export function Content({ items: itemsFromServer }: ContentProps) {
  const [creatingItem, setCreatingItem] = useState(false);
  const [items, setItems] = useState([...itemsFromServer]);
  const session = authClient.useSession();

  async function handleSaveItem(item: PartialItem) {
    const fullItem: ItemAndBasicUserBorrower = {
      ...item,
      id: -1,
      status: 'available',
      borrower: null
    };
    setItems((prev) => [...prev, fullItem]);
    setCreatingItem(false);
    const res = await tsr.item.createItem.mutate({ body: item });
    if (res.status === 200) {
      setItems((items) =>
        items.map((item) =>
          item.id === -1 ? { ...item, id: res.body.id, status: res.body.status } : item
        )
      );
    } else {
      setItems((items) => items.filter((item) => item.id !== -1));
      toast.add({
        type: 'error',
        title: res.status === 500 ? res.body.message : 'Failed to create item'
      });
    }
  }

  function setItemStatus(itemId: number, status: ItemType['status'], borrowerId: string | null) {
    // replace the matching item with a copy that has the new status, leaving the rest unchanged
    setItems((items) =>
      items.map((item) => (item.id === itemId ? { ...item, status, borrower: borrowerId } : item))
    );
  }

  async function handleCheckOut(itemId: number) {
    if (session.data === null) {
      toast.add({ type: 'error', title: 'Log in to check out an item' });
      return;
    }

    const oldItem = { ...items.find((item) => item.id === itemId)! };

    setItemStatus(itemId, 'booked', session.data.user.id);
    const res = await tsr.item.checkOut.mutate({
      params: { id: itemId },
      body: { borrowerId: session.data.user.id }
    });
    if (res.status !== 200) {
      setItemStatus(itemId, oldItem.status, oldItem.borrower);

      toast.add({
        type: 'error',
        title:
          res.status === 404 || res.status === 409 || res.status === 500
            ? res.body.message
            : 'Failed to check out item'
      });
    }
  }

  async function handleReturn(itemId: number) {
    if (session.data === null) {
      toast.add({ type: 'error', title: 'Log in to return an item' });
      return;
    }

    const oldItem = { ...items.find((item) => item.id === itemId)! };

    setItemStatus(itemId, 'available', session.data?.user.id ?? null);
    const res = await tsr.item.returnItem.mutate({ params: { id: itemId } });
    if (res.status !== 200) {
      setItemStatus(itemId, oldItem.status, oldItem.borrower);

      toast.add({
        type: 'error',
        title:
          res.status === 404 || res.status === 409 || res.status === 500
            ? res.body.message
            : 'Failed to return item'
      });
    }
  }

  return (
    <main>
      <div className="p-8 flex flex-col gap-4">
        {creatingItem ? (
          <CreateItemForm onSave={handleSaveItem} onCancel={() => setCreatingItem(false)} />
        ) : (
          <Button onClick={() => setCreatingItem(true)} className="w-fit">
            Create Item <Plus />
          </Button>
        )}
        <Items
          items={items}
          onCheckOut={handleCheckOut}
          onReturn={handleReturn}
          allowCheckInOut={session.data !== null}
        />
      </div>
    </main>
  );
}
