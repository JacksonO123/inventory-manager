import { useId } from 'react';
import { Item as ItemType } from '../../../types/types';

type ItemsProps = { items: ItemType[] };

export function Items({ items }: ItemsProps) {
  const listId = useId();

  return (
    <div>
      {items.map((item, index) => (
        <Item item={item} key={`item-${index}-${listId}`} />
      ))}
    </div>
  );
}

type ItemProps = {
  item: ItemType;
};

function Item({ item }: ItemProps) {
  return (
    <div className="flex flex-col">
      <span>Name: {item.name}</span>
      <span>Description: {item.description}</span>
    </div>
  );
}
