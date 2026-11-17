import { useId } from 'react';
import { ItemAndBasicUserBorrower, Org } from '../../../types/types';
import { Item } from './Item';

type ItemsProps = {
  items: ItemAndBasicUserBorrower[];
  org: Org;
  allowCheckInOut: boolean;
  onCheckOut: (itemId: number) => void;
  onReturn: (itemId: number) => void;
};

export function Items({ items, org, allowCheckInOut, onCheckOut, onReturn }: ItemsProps) {
  const listId = useId();

  return (
    <div className="flex gap-6 flex-wrap">
      {items.map((item, index) => (
        <Item
          item={item}
          org={org}
          onCheckOut={() => onCheckOut(item.id)}
          onReturn={() => onReturn(item.id)}
          key={`item-${index}-${listId}`}
          allowCheckInOut={allowCheckInOut}
        />
      ))}
    </div>
  );
}
