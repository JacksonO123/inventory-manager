import { useId } from 'react';
import { Item as ItemType } from '../../../types/types';
import { Item } from './Item';

type ItemsProps = {
  items: ItemType[];
  onCheckOut: (itemId: number) => void;
  onReturn: (itemId: number) => void;
};

export function Items({ items, onCheckOut, onReturn }: ItemsProps) {
  const listId = useId();

  return (
    <div className="flex gap-6">
      {items.map((item, index) => (
        <Item
          item={item}
          onCheckOut={onCheckOut}
          onReturn={onReturn}
          key={`item-${index}-${listId}`}
        />
      ))}
    </div>
  );
}
