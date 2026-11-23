'use client';

import type { DateSelectInfo, EventInput } from '@fullcalendar/react';
import themePlugin from '@fullcalendar/react/themes/breezy';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import interactionPlugin from '@fullcalendar/react/interaction';
import resourceTimelinePlugin from '@fullcalendar/react-scheduler/resource-timeline';

import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/breezy/theme.css';
import '@fullcalendar/react/themes/breezy/palettes/indigo.css';
import './style.css';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const FullCalendar = dynamic(() => import('@fullcalendar/react').then((mod) => mod.default), {
  ssr: false
});
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { MAX_FREE_RESERVE_HOURS } from '../../utils/constants';
import { PENDING_CLASS_NAME } from './constants';
import { toDate } from './utils';
import { hoursBetween, tsrErrorMessage } from '../../utils/utils';
import { tsr } from '../../server/tsr';
import { toast } from '../ui/toast';
import {
  Item,
  Org,
  Reservation,
  ReservationWithOptionalBorrowerName,
  ServerErrorRes
} from '../../types/types';
import { authClient } from '../../client/auth-client';

type CalendarProps = React.ComponentProps<'div'> & {
  defaultReservation: Reservation[];
  org: Org;
  item: Item;
};

export function ItemCalendar({ org, item, defaultReservation, ...props }: CalendarProps) {
  const session = authClient.useSession();
  const [events, setReservations] = useState<EventInput[]>(
    defaultReservation.map(({ status, ...res }) =>
      status === 'pending' ? { ...res, className: PENDING_CLASS_NAME } : res
    )
  );
  const [lastAddedEventId, setLastAddedEventId] = useState<string | null>(null);

  const handleSelectEvent = (info: DateSelectInfo) => {
    if (session.data === null) return;

    info.view.calendar.unselect();

    const eventId = crypto.randomUUID();
    setLastAddedEventId(eventId);

    setReservations((prev) => [
      ...prev,
      {
        id: eventId,
        title: `${session.data!.user.name}'s reservation`,
        start: info.start,
        end: info.end,
        allDay: info.allDay
      }
    ]);
  };

  async function handleAddReservation(
    event: EventInput,
    status: Reservation['status']
  ): Promise<ServerErrorRes<string>> {
    if (session.data === null || event.start === undefined || event.end === undefined) {
      return { status: 'error' };
    }

    const res = await tsr.reservation.addReservation.mutate({
      body: {
        orgId: org.id,
        itemId: item.id,
        borrowerId: session.data.user.id,
        event: {
          orgId: org.id,
          itemId: item.id,
          start: toDate(event.start),
          end: toDate(event.end),
          allDay: !!event.allDay,
          status
        }
      }
    });

    if (res.status === 200) {
      toast.add({
        type: 'success',
        title: 'Successfully added item reservation'
      });
      return { status: 'success', body: res.body.id };
    }

    toast.add({
      type: 'error',
      title: tsrErrorMessage(res.body, 'Failed to add item reservation')
    });

    return { status: 'error' };
  }

  async function commitEvent() {
    if (lastAddedEventId === null) return;
    const event = events.find((event) => event.id === lastAddedEventId);
    if (event === undefined) return;
    if (event.start === undefined || event.end === undefined) return;

    setLastAddedEventId(null);

    let successStatus: ServerErrorRes<string>;

    const difference = hoursBetween(toDate(event.start), toDate(event.end));
    if (difference > MAX_FREE_RESERVE_HOURS) {
      const newEvent = events.find((res) => res.id === lastAddedEventId);
      setReservations((events) =>
        events.map((item) => {
          if (item.id === lastAddedEventId) {
            return {
              ...item,
              className: PENDING_CLASS_NAME
            };
          }
          return item;
        })
      );

      if (newEvent === undefined) return;

      successStatus = await handleAddReservation(newEvent, 'pending');
    } else {
      const newEvent = events.find((event) => event.id === lastAddedEventId) ?? null;
      if (newEvent === null) return;
      successStatus = await handleAddReservation(newEvent, 'accepted');
    }

    if (successStatus.status === 'success') {
      setReservations((prev) =>
        prev.map((res) => (res.id === lastAddedEventId ? { ...res, id: successStatus.body } : res))
      );
    } else {
      setReservations((prev) => prev.filter((res) => res.id !== lastAddedEventId));
    }
  }

  function filterAddedEvent() {
    if (lastAddedEventId === null) return;
    setReservations((events) => events.filter((event) => event.id !== lastAddedEventId));
    setLastAddedEventId(null);
  }

  return (
    <>
      <Dialog open={lastAddedEventId !== null} onOpenChange={(open) => !open && filterAddedEvent()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm reservation?</DialogTitle>
            <div className="flex gap-4">
              <Button onClick={commitEvent} className="flex-1">
                Yes
              </Button>
              <Button onClick={filterAddedEvent} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div {...props}>
        <FullCalendar
          plugins={[themePlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          selectable={true}
          selectMirror={true}
          select={handleSelectEvent}
          events={events}
          editable={true}
          slotDuration="00:15:00"
          nowIndicator={true}
          height="100%"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay'
          }}
          eventDidMount={(info) => {
            if (info.event.extendedProps.status === 'pending') {
              info.el.style.borderStyle = 'dashed';
              info.el.style.borderWidth = '2px';
              info.el.style.opacity = '0.8';
            }
          }}
        />
      </div>
    </>
  );
}

type OrgItemCalendarSummaryProps = React.ComponentProps<'div'> & {
  items: Item[];
  reservations: ReservationWithOptionalBorrowerName[];
};

export function OrgItemCalendarSummary({
  items,
  reservations,
  ...props
}: OrgItemCalendarSummaryProps) {
  const itemIdToName = items.reduce(
    (acc, curr) => {
      acc[curr.id] = curr.name;
      return acc;
    },
    {} as Record<number, string>
  );

  const events = reservations.flatMap((reservation) => {
    const withResourceId = {
      ...reservation,
      resourceId: reservation.itemId + '',
      title: `${reservation.borrowerName ?? 'Anonymous'}'s reservation`
    };
    return reservation.status === 'pending'
      ? { ...withResourceId, className: PENDING_CLASS_NAME }
      : withResourceId;
  });

  return (
    <div {...props}>
      <FullCalendar
        plugins={[themePlugin, resourceTimelinePlugin]}
        schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
        headerToolbar={{
          start: 'today prev,next title',
          end: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth'
        }}
        height="100%"
        initialView="resourceTimelineDay"
        resources={reservations.map((reservation) => ({
          id: reservation.itemId + '',
          title: itemIdToName[reservation.itemId]
        }))}
        events={events}
      />
    </div>
  );
}
