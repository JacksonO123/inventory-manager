import { create } from 'zustand';
import { Item } from '../types/types';

type ItemsState = {
  items: Record<number, Item[]>;
};

type ItemsActions = {
  setItems: (items: Record<number, Item[]>) => void;
  setItemsFor: (orgId: number, items: Item[] | ((items: Item[]) => Item[])) => void;
};

export const useItems = create<ItemsState & ItemsActions>((set) => ({
  items: {},
  setItems: (items) => set({ items }),
  setItemsFor: (orgId, items) =>
    set((state) => ({
      items: {
        ...state.items,
        [orgId]: typeof items === 'function' ? items(state.items[orgId] ?? []) : items
      }
    }))
}));
