'use client';

import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import type { Item, ItemAndBasicUserBorrower, Org, PartialItem } from '../../../../types/types';
import { useState } from 'react';
import { tsr } from '../../../../server/tsr';
import { toast } from '../../../../components/ui/toast';
import { CreateItemForm } from '../components/CreateItemForm';
import { Items } from '../components/Items';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { tsrErrorMessage } from '../../../../utils/utils';

type ItemsManagerProps = {
  items: Item[];
  org: Org;

  customActionBarRenderFn?: (createItem: () => void) => React.ReactNode;
};

export function ItemsManager({
  items: itemsFromServer,
  org,
  customActionBarRenderFn
}: ItemsManagerProps) {
  const [creatingItem, setCreatingItem] = useState(false);
  const [items, setItems] = useState([...itemsFromServer]);

  async function handleSaveItem(item: PartialItem) {
    const fullItem: ItemAndBasicUserBorrower = {
      ...item,
      id: -1,
      status: 'available',
      borrower: null
    };
    setItems((prev) => [...prev, fullItem]);
    setCreatingItem(false);
    const res = await tsr.item.createItem.mutate({ body: { ...item, orgId: org.id } });
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
        title: tsrErrorMessage(res.body, 'Failed to create item')
      });
    }
  }

  return (
    <div className="flex flex-col items-center w-full">
      <Dialog open={creatingItem} onOpenChange={setCreatingItem}>
        <DialogContent className="pr-4">
          <DialogHeader>
            <DialogTitle>Create new Item</DialogTitle>
          </DialogHeader>
          <CreateItemForm onSave={handleSaveItem} onCancel={() => setCreatingItem(false)} />
        </DialogContent>
      </Dialog>

      {customActionBarRenderFn ? (
        customActionBarRenderFn(() => setCreatingItem(true))
      ) : (
        <div className="w-full p-4 rounded-md border flex gap-4 justify-end">
          <Button className="w-fit" onClick={() => setCreatingItem(true)}>
            Create Item <Plus />
          </Button>
        </div>
      )}
      <div className="w-full pt-8 flex justify-center">
        <Items items={items} org={org} />
      </div>
    </div>
  );
}
