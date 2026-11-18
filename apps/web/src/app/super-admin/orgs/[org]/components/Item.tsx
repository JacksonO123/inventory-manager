import { Org, Item as ItemType } from '../../../../../types/types';
import Link from 'next/link';

type ItemProps = {
  item: ItemType;
  org: Org;
};

export function Item({ item, org }: ItemProps) {
  return (
    <Link href={`/item/${org.path}/${item.id}`}>
      <div className="flex flex-col border rounded-lg overflow-hidden w-fit max-w-72 duration-150 hover:scale-105">
        <div className="w-72 h-32 max-h-32 bg-linear-to-br from-primary to-primary/50">
          {/* image of item goes here */}
        </div>
        <div className="py-2 px-3">
          <h1 className="font-medium text-lg text-ellipsis truncate" title={item.name}>
            {item.name}
          </h1>
          <p className="text-sm text-ellipsis truncate" title={item.description ?? undefined}>
            {item.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
