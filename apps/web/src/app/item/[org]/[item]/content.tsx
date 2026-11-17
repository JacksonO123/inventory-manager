'use client';

import { Calendar } from '../../../../components/Calendar';
import { PageHeader } from '../../../../components/PageHeader';
import { Item, Org } from '../../../../types/types';

type ItemPageContentsProps = {
  item: Item;
  org: Org;
};

export function ItemPageContents({ item, org }: ItemPageContentsProps) {
  return (
    <main className="h-screen flex flex-col">
      <PageHeader />
      <div className="p-20 h-full">
        <Calendar className="h-full" item={item} org={org} />
      </div>
    </main>
  );
}
