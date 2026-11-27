import { useItems } from '../stores/items';
import { Item } from '../types/types';

export function useItemsFor(orgId: number) {
  const storedItems = useItems((state) => state.items[orgId]);
  const items = storedItems ?? [];
  const setItemsForFromState = useItems((state) => state.setItemsFor);

  function handleSetItems(newItems: Item[] | ((newItems: Item[]) => Item[])) {
    setItemsForFromState(orgId, (items) =>
      typeof newItems === 'function' ? newItems(items) : newItems
    );
  }

  return { items, setItems: handleSetItems };
}
