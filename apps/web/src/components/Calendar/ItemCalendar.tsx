'use client';

import type { DateSelectInfo } from '@fullcalendar/react';
import themePlugin from '@fullcalendar/react/themes/breezy';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import interactionPlugin from '@fullcalendar/react/interaction';
import resourceTimelinePlugin from '@fullcalendar/react-scheduler/resource-timeline';

import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/breezy/theme.css';
import '@fullcalendar/react/themes/breezy/palettes/indigo.css';
import './style.css';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef } from 'react';

const FullCalendar = dynamic(() => import('@fullcalendar/react').then((mod) => mod.default), {
  ssr: false
});

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { MAX_FREE_RESERVE_HOURS } from '../../utils/constants';
import { PENDING_CLASS_NAME } from './constants';
import { hoursBetween } from '../../utils/utils';
import { toast } from '../ui/toast';
import { Item, Org, Reservation } from '../../types/types';
import { authClient } from '../../client/auth-client';
import {
  useReservationCrudForItem,
  useReservationCrudForOrg
} from '../../hooks/use-reservation-crud';
import { useReservationsFor } from '../../hooks/use-reservations-for';
import { useReservations } from '../../stores/reservations';
import { useItemsFor } from '../../hooks/use-items-for';

type CalendarProps = React.ComponentProps<'div'> & {
  org: Org;
  item: Item;
};

export function ItemCalendar({ org, item, ...props }: CalendarProps) {
  const session = authClient.useSession();
  const { reservations, setTempReservation, tempReservation } = useReservationsFor(item.id);
  const { addReservation, fetchReservationsBetweenDates } = useReservationCrudForItem(
    org.id,
    item.id
  );
  const events = useMemo(
    () =>
      (tempReservation ? [...reservations, tempReservation] : reservations).map(
        ({ status, ...res }) =>
          status === 'pending' ? { ...res, className: PENDING_CLASS_NAME } : res
      ),
    [reservations, tempReservation]
  );

  const visibleRangeRef = useRef<{ start: Date; end: Date } | null>(null);

  const handleSelectEvent = (info: DateSelectInfo) => {
    if (session.data === null) return;

    info.view.calendar.unselect();

    const eventId = crypto.randomUUID();
    const numHours = hoursBetween(info.start, info.end);

    const reservation: Reservation = {
      id: eventId,
      orgId: org.id,
      itemId: item.id,
      start: info.start,
      end: info.end,
      status: numHours > MAX_FREE_RESERVE_HOURS ? 'pending' : 'accepted',
      allDay: info.allDay ?? false,
      borrower: session.data.user.id
    };

    setTempReservation(reservation);
  };

  async function commitEvent() {
    if (session.data === null || tempReservation === null) return;

    const res = await addReservation(tempReservation, session.data.user.id);

    setTempReservation(null);

    if (res.status === 'error') {
      toast.add({
        type: 'error',
        title: res.error ?? 'Failed to add reservation'
      });
    }
  }

  useEffect(() => {
    if (session.data === null) return;
    if (visibleRangeRef.current === null) return;
    const { start, end } = visibleRangeRef.current;
    fetchReservationsBetweenDates(start, end);
  }, [session.data]);

  return (
    <>
      <Dialog
        open={tempReservation !== null}
        onOpenChange={(open) => !open && setTempReservation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm reservation?</DialogTitle>
            <div className="flex gap-4">
              <Button onClick={commitEvent} className="flex-1">
                Yes
              </Button>
              <Button onClick={() => setTempReservation(null)} variant="outline" className="flex-1">
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
              fetchReservationsBetweenDates(arg.start, arg.end);
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
  org: Org;
};

export function OrgItemCalendarSummary({ org, ...props }: OrgItemCalendarSummaryProps) {
  const session = authClient.useSession();
  const { items } = useItemsFor(org.id);
  const { reservations } = useReservations();
  const { fetchReservationsBetweenDates } = useReservationCrudForOrg(org.id);
  const itemIdToName = useMemo(
    () =>
      items.reduce(
        (acc, curr) => {
          acc[curr.id] = curr.name;
          return acc;
        },
        {} as Record<number, string>
      ),
    [items]
  );

  const visibleRangeRef = useRef<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    if (session.data === null) return;
    if (visibleRangeRef.current === null) return;
    const { start, end } = visibleRangeRef.current;
    fetchReservationsBetweenDates(start, end);
  }, [session.data]);

  const flatReservations = useMemo(() => Object.values(reservations).flat(), [reservations]);

  const resources = useMemo(
    () =>
      Object.keys(reservations).map((itemId) => ({
        id: itemId,
        title: itemIdToName[Number(itemId)]
      })),
    [reservations, itemIdToName]
  );

  const events = flatReservations.map((reservation) => {
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
        datesSet={(arg) => {
          visibleRangeRef.current = { start: arg.start, end: arg.end };
          if (session.data !== null) {
            fetchReservationsBetweenDates(arg.start, arg.end);
          }
        }}
        height="100%"
        initialView="resourceTimelineDay"
        resources={resources}
        events={events}
      />
    </div>
  );
}
