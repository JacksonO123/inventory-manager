'use client';

import { useElementSize, useLocalStorage } from '@mantine/hooks';
import { OrgItemCalendarSummary } from '../../../../components/Calendar';
import { Tab, TabContent, TabGroup, Tabs } from '../../../../components/Tabs';
import { Org } from '../../../../types/types';
import { ItemsManager } from './ItemsManager.tsx';
import { Button } from '../../../../components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from 'cn';
import { useId } from 'react';
import { ReservationRequestCard } from './ReservationRequestPreview';
import { useReservationCrudForOrg } from '../../../../hooks/use-reservation-crud';
import { useRequests } from '../../../../hooks/use-requests';

type SuperAdminTabGroupProps = {
  org: Org;
};

export function CalendarAndItemsTabGroup({ org }: SuperAdminTabGroupProps) {
  const requests = useRequests();
  const { accept, reject } = useReservationCrudForOrg(org.id);
  const calendarId = useId();

  const [tab, setTab] = useLocalStorage<string | null>({
    key: `calendar-and-items-tab-group-${org.path}-state`,
    defaultValue: null
  });
  const { ref: tabRef, width: tabWidth } = useElementSize();

  return (
    <div className="relative flex flex-col gap-4 h-full">
      <Tabs onTabChange={setTab} tab={tab}>
        <TabGroup className="absolute" ref={tabRef}>
          <Tab value="calendar">Calendar</Tab>
          <Tab value="items">Items</Tab>
          <Tab value="reservation-requests" className="flex gap-2 items-center">
            Reservation Requests{' '}
            <div
              className={cn(
                'text-[0.7rem] w-4 h-4 flex items-center justify-center rounded-full',
                requests.length > 0 ? 'bg-primary text-white' : 'bg-secondary'
              )}
            >
              {requests.length}
            </div>
          </Tab>
        </TabGroup>
        <TabContent tab="calendar">
          <div className="h-8" />
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
        <TabContent tab="reservation-requests">
          <div className="h-8" />
          {requests.map((req, index) => (
            <ReservationRequestCard
              req={req}
              key={`reservation-request-${index}-${calendarId}`}
              onAccept={() => accept(req.itemId, req.id)}
              onReject={() => reject(req.itemId, req.id)}
            />
          ))}
        </TabContent>
      </Tabs>
    </div>
  );
}
