'use client';

import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import type { Org } from '../../../../types/types';
import { useState } from 'react';
import { CreateItemForm } from '../components/CreateItemForm';
import { Items } from '../components/Items';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { useItemCrudFor } from '../../../../hooks/use-item-crud';
import { useItemsFor } from '../../../../hooks/use-items-for';

type ItemsManagerProps = {
  org: Org;

  customActionBarRenderFn?: (createItem: () => void) => React.ReactNode;
};

export function ItemsManager({ org, customActionBarRenderFn }: ItemsManagerProps) {
  const [creatingItem, setCreatingItem] = useState(false);
  const { items } = useItemsFor(org.id);
  const { createItem } = useItemCrudFor(org.id);

  return (
    <div className="flex flex-col items-center w-full">
      <Dialog open={creatingItem} onOpenChange={setCreatingItem}>
        <DialogContent className="pr-4">
          <DialogHeader>
            <DialogTitle>Create new Item</DialogTitle>
          </DialogHeader>
          <CreateItemForm
            onSave={(item) => {
              createItem(item);
              setCreatingItem(false);
            }}
            onCancel={() => setCreatingItem(false)}
          />
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
