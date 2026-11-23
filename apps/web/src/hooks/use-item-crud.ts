import { toast } from '../components/ui/toast';
import { tsr } from '../server/tsr';
import { useItemsFor } from '../stores/items';
import { ItemAndBasicUserBorrower, PartialItem } from '../types/types';
import { tsrErrorMessage } from '../utils/utils';

export function useItemCrudFor(orgId: number) {
  const { setItems } = useItemsFor(orgId);

  async function createItem(item: PartialItem) {
    const fullItem: ItemAndBasicUserBorrower = {
      ...item,
      id: -1,
      status: 'available',
      borrower: null
    };
    setItems((prev) => [...prev, fullItem]);
    const res = await tsr.item.createItem.mutate({ body: { ...item, orgId: orgId } });
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

  return { createItem };
}
