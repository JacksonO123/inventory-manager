import { create } from 'zustand';
import { Item } from '../types/types';

type ItemsState = {
  items: Record<number, Item[]>;
};

type ItemsActions = {
  setItems: (items: Record<number, Item[]>) => void;
};

export const useItems = create<ItemsState & ItemsActions>((set) => ({
  items: {},
  setItems: (items) => set({ items })
}));
