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

type ContentProps = {
  items: ItemType[];
};

export function Content({ items: itemsFromServer }: ContentProps) {
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
