import { create } from 'zustand';
import { Item } from '../types/types';

type ItemsState = {
  items: Record<number, Item[]>;
};

type ItemsActions = {
  setItems: (items: Record<number, Item[]>) => void;
  setItemsFor: (orgId: number, items: Item[]) => void;
};

export const useItems = create<ItemsState & ItemsActions>((set) => ({
  items: {},
  setItems: (items) => set({ items }),
  setItemsFor: (orgId: number, items: Item[]) =>
    set((state) => ({ items: { ...state.items, [orgId]: items } }))
}));

export function useItemsFor(orgId: number) {
  const items = useItems((state) => state.items[orgId] ?? []);
  const setItemsForFromState = useItems((state) => state.setItemsFor);

  function handleSetItems(newItems: Item[]) {
    setItemsForFromState(orgId, newItems);
  }

  return { items, setItems: handleSetItems };
}
