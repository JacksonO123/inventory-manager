'use client';

import { ItemCalendar } from '../../../../components/Calendar';
import { Item, Org, Reservation } from '../../../../types/types';

type ItemPageContentsProps = {
  defaultReservations: Reservation[];
  item: Item;
  org: Org;
};

export function ItemPageContents({ item, org, defaultReservations }: ItemPageContentsProps) {
  return <ItemCalendar className="h-full w-full" item={item} org={org} />;
}
