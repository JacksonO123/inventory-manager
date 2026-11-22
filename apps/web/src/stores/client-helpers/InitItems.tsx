'use client';

import { useEffect } from 'react';
import { Item } from '../../types/types';
import { useItems } from '../items';

type InitItemsProps = {
  items: Record<number, Item[]>;
};

export function InitItems({ items }: InitItemsProps) {
  const { setItems } = useItems();

  useEffect(() => {
    setItems(items);
  }, []);

  return null;
}
