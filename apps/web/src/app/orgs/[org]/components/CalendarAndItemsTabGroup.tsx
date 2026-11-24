'use client';

import { useElementSize, useLocalStorage } from '@mantine/hooks';
import { OrgItemCalendarSummary } from '../../../../components/Calendar';
import { Tab, TabContent, TabGroup, Tabs } from '../../../../components/Tabs';
import { Org } from '../../../../types/types';
import { ItemsManager } from './ItemsManager.tsx';
import { Button } from '../../../../components/ui/button';
import { Plus } from 'lucide-react';
import { useReservations } from '../../../../stores/reservations';

type SuperAdminTabGroupProps = {
  org: Org;
};

export function CalendarAndItemsTabGroup({ org }: SuperAdminTabGroupProps) {
  const { requests } = useReservations();

  const [tab, setTab] = useLocalStorage<string | null>({
    key: `calendar-and-items-tab-group-${org.path}-state`,
    defaultValue: null
  });
  const { ref: tabRef, width: tabWidth } = useElementSize();

  const totalRequests = Object.values(requests)
    .map((itemRequests) => itemRequests.length)
    .reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="relative flex flex-col gap-4 h-full">
      <Tabs onTabChange={setTab} tab={tab}>
        <TabGroup className="absolute" ref={tabRef}>
          <Tab value="calendar">Calendar</Tab>
          <Tab value="items">Items</Tab>
          <Tab value="reservation-requests">Reservation Requests ({totalRequests})</Tab>
        </TabGroup>
        <TabContent tab="calendar">
          <div className="h-8"></div>
          <OrgItemCalendarSummary className="h-full min-h-140" org={org} />
        </TabContent>
        <TabContent tab="items">
          <ItemsManager
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
