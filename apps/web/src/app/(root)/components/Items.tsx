import { useId } from 'react';
import { Org } from '../../../types/types';
import { Item } from './Item';
import { Item as ItemType } from '../../../types/types';

type ItemsProps = {
  items: ItemType[];
  org: Org;
  allowCheckInOut: boolean;
};

export function Items({ items, org, allowCheckInOut }: ItemsProps) {
  const listId = useId();

  return (
    <div className="flex gap-6 flex-wrap">
      {items.map((item, index) => (
        <Item
          item={item}
          org={org}
          key={`item-${index}-${listId}`}
          allowCheckInOut={allowCheckInOut}
        />
      ))}
    </div>
  );
}
