'use client';

import { ItemCalendar } from '../../../../components/Calendar';
import { Item, Org } from '../../../../types/types';

type ItemPageContentsProps = {
  item: Item;
  org: Org;
};

export function ItemPageContents({ item, org }: ItemPageContentsProps) {
  return <ItemCalendar className="h-full w-full" item={item} org={org} />;
}
