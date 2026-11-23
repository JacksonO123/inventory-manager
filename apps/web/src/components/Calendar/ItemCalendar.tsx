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
import { useEffect, useRef, useState } from 'react';

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
import { useReservations } from '../../stores/reservations';

type CalendarProps = React.ComponentProps<'div'> & {
  defaultReservation: Reservation[];
  org: Org;
  item: Item;
};

export function ItemCalendar({ org, item, defaultReservation, ...props }: CalendarProps) {
  const session = authClient.useSession();
  const { setReservations: setStoreReservations } = useReservations();
  const [events, setEvents] = useState<EventInput[]>(
    defaultReservation.map(({ status, ...res }) =>
      status === 'pending' ? { ...res, className: PENDING_CLASS_NAME } : res
    )
  );
  const [lastAddedEventId, setLastAddedEventId] = useState<string | null>(null);

  const visibleRangeRef = useRef<{ start: Date; end: Date } | null>(null);
  const lastAddedEventIdRef = useRef<string | null>(null);

  useEffect(() => {
    lastAddedEventIdRef.current = lastAddedEventId;
  }, [lastAddedEventId]);

  const handleSelectEvent = (info: DateSelectInfo) => {
    if (session.data === null) return;

    info.view.calendar.unselect();

    const eventId = crypto.randomUUID();
    setLastAddedEventId(eventId);

    setEvents((prev) => [
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
      setEvents((events) =>
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
      setEvents((prev) =>
        prev.map((res) => (res.id === lastAddedEventId ? { ...res, id: successStatus.body } : res))
      );
    } else {
      setEvents((prev) => prev.filter((res) => res.id !== lastAddedEventId));
    }
  }

  function filterAddedEvent() {
    if (lastAddedEventId === null) return;
    setEvents((events) => events.filter((event) => event.id !== lastAddedEventId));
    setLastAddedEventId(null);
  }

  async function fetchRelevantReservations(start: Date, end: Date) {
    const fetched = await tsr.reservation.getByItemIdAndOrgPathBetweenDates.mutate({
      params: { orgPath: org.path, itemId: item.id },
      body: { start, end }
    });
    if (fetched.status !== 200) {
      toast.add({
        type: 'error',
        title: 'Failed to fetch reservations for calendar'
      });
      return;
    }

    const fetchedReservations = fetched.body;

    setStoreReservations(fetchedReservations);

    setEvents((prev) => {
      const pendingId = lastAddedEventIdRef.current;
      const pendingEvent =
        pendingId !== null ? prev.find((event) => event.id === pendingId) : undefined;
      const fetchedEvents = fetchedReservations.map(({ status, ...res }) =>
        status === 'pending' ? { ...res, className: PENDING_CLASS_NAME } : res
      );
      return pendingEvent !== undefined ? [...fetchedEvents, pendingEvent] : fetchedEvents;
    });
  }

  useEffect(() => {
    if (session.data === null) return;
    if (visibleRangeRef.current === null) return;
    const { start, end } = visibleRangeRef.current;
    tsr.reservation.getByItemIdAndOrgPathBetweenDates.mutate({
      params: { orgPath: org.path, itemId: item.id },
      body: { start, end }
    });
  }, [session.data]);

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
          datesSet={(arg) => {
            visibleRangeRef.current = { start: arg.start, end: arg.end };
            if (session.data !== null) {
              void fetchRelevantReservations(arg.start, arg.end);
            }
          }}
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
