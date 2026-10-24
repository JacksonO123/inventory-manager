import { useId } from 'react';
import { Item as ItemType } from '../../../types/types';
import { Item } from './Item';

type ItemsProps = { items: ItemType[] };

export function Items({ items }: ItemsProps) {
  const listId = useId();

  return (
    <div className="flex gap-6">
      {items.map((item, index) => (
        <Item item={item} key={`item-${index}-${listId}`} />
      ))}
    </div>
  );
}
