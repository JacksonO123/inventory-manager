'use client';

import { useElementSize, useLocalStorage } from '@mantine/hooks';
import { OrgItemCalendarSummary } from '../../../../../components/Calendar';
import { Tab, TabContent, TabGroup, Tabs } from '../../../../../components/Tabs';
import { Item, Org, ReservationWithBorrowerName } from '../../../../../types/types';
import { ItemsManager } from '../ItemsManager.tsx';
import { Button } from '../../../../../components/ui/button';
import { Plus } from 'lucide-react';

type SuperAdminTabGroupProps = {
  org: Org;
  items: {
    item: Item;
    reservations: ReservationWithBorrowerName[];
  }[];
};

export function SuperAdminTabGroup({ org, items }: SuperAdminTabGroupProps) {
  const [tab, setTab] = useLocalStorage<string | null>({
    key: 'super-admin-tab-group-state',
    defaultValue: null
  });
  const { ref: tabRef, width: tabWidth } = useElementSize();

  return (
    <div className="relative flex flex-col gap-4 h-full">
      <Tabs onTabChange={setTab} tab={tab}>
        <TabGroup className="absolute" ref={tabRef}>
          <Tab value="calendar">Calendar</Tab>
          <Tab value="items">Items</Tab>
        </TabGroup>
        <TabContent tab="calendar">
          <div className="h-8"></div>
          <OrgItemCalendarSummary className="h-full min-h-140" items={items} />
        </TabContent>
        <TabContent tab="items">
          <ItemsManager
            items={items.map((info) => info.item)}
            org={org}
            customActionBarRenderFn={(createItem) => (
              <div className="flex justify-between flex-wrap gap-4 w-full">
                <div style={{ minWidth: `${tabWidth}px` }} className="h-8" />
                <Button onClick={createItem}>
                  Create Item <Plus />
                </Button>
              </div>
            )}
          />
        </TabContent>
      </Tabs>
    </div>
  );
}
