'use client';

import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useState } from 'react';
import { CreateItemForm } from './components/CreateItemForm';
import { tsr } from '../../server/tsr';
import { Item as ItemType, PartialItem } from '../../types/types';
import { Items } from './components/Items';
import { AuthPopup } from '../../components/AuthPopup';
import { toast } from '../../components/ui/toast';
import { useBasicAuth } from '../../hooks/useBasicAuth';
import { useAuthPopup } from '../../hooks/useAuthPopup';

type ContentProps = {
  items: ItemType[];
};

export function Content({ items: itemsFromServer }: ContentProps) {
  const [creatingItem, setCreatingItem] = useState(false);
  const [items, setItems] = useState([...itemsFromServer]);
  const { basicUser } = useBasicAuth();
  const { setOpen: setAuthPopupOpen, setAuthType } = useAuthPopup();

  function openBorrowerForm() {
    setAuthType('signup');
    setAuthPopupOpen(true);
  }

  async function handleSaveItem(item: PartialItem) {
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
    } else {
      setItems((items) => items.filter((item) => item.id !== -1));
      toast.add({
        type: 'error',
        title: res.status === 500 ? res.body.message : 'Failed to create item'
      });
    }
  }

  function setItemStatus(itemId: number, status: ItemType['status']) {
    setItems((items) => items.map((item) => (item.id === itemId ? { ...item, status } : item))); // replace the matching item with a copy that has the new status, leaving the rest unchanged
  }

  async function handleCheckOut(itemId: number) {
  if (basicUser === null) {
    toast.add({ type: 'error', title: 'Log in to check out an item' });
    return;
  }

    const res = await tsr.item.checkOut.mutate({
      params: { id: itemId },
      body: { borrowerId: basicUser.id }
    });
    if (res.status === 200) {
      setItemStatus(itemId, 'booked');
    } else {
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
    if (basicUser === null) {
      openBorrowerForm();
      return;
    }
    const res = await tsr.item.returnItem.mutate({
      params: { id: itemId },
      body: { borrowerId: basicUser.id }
    });
    if (res.status === 200) {
      setItemStatus(itemId, 'available');
    } else {
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
      <AuthPopup />
      <div className="p-8 flex flex-col gap-4">
        {creatingItem ? (
          <CreateItemForm onSave={handleSaveItem} onCancel={() => setCreatingItem(false)} />
        ) : (
          <Button onClick={() => setCreatingItem(true)} className="w-fit">
            Create Item <Plus />
          </Button>
        )}
        <Items items={items} onCheckOut={handleCheckOut} onReturn={handleReturn} />
      </div>
    </main>
  );
}
