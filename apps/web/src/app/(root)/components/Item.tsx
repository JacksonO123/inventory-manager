import { Item as ItemType } from '../../../types/types';

type ItemProps = {
  item: ItemType;
};

export function Item({ item }: ItemProps) {
  return (
    <div className="flex flex-col border rounded-lg overflow-hidden w-fit hover:scale-102 duration-150 cursor-pointer">
      <div className="w-72 h-32 bg-linear-to-br from-primary to-primary/50">
        {/* image of item goes here */}
      </div>
      <div className="py-2 px-3">
        <div className="font-medium text-lg">{item.name}</div>
        <div className="text-sm">{item.description}</div>
      </div>
    </div>
  );
}
