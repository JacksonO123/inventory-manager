import FullCalendar, { DateSelectInfo, EventInput } from '@fullcalendar/react';
import themePlugin from '@fullcalendar/react/themes/breezy';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import interactionPlugin from '@fullcalendar/react/interaction';

import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/breezy/theme.css';
import '@fullcalendar/react/themes/breezy/palettes/indigo.css';
import './style.css';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { MAX_FREE_RESERVE_HOURS } from '../../utils/constants';
import { PENDING_CLASS_NAME } from './constants';
import { toDate } from './utils';
import { hoursBetween } from '../../utils/utils';
import { tsr } from '../../server/tsr';
import { toast } from '../ui/toast';
import { Item, Org, Reservation } from '../../types/types';

type CalendarProps = React.ComponentProps<'div'> & {
  defaultReservation: Reservation[];
  org: Org;
  item: Item;
};

export function Calendar({ org, item, defaultReservation, ...props }: CalendarProps) {
  console.log(defaultReservation);
  const [events, setEvents] = useState<EventInput[]>(defaultReservation);
  const [lastAddedEventId, setLastAddedEventId] = useState<string | null>(null);

  const handleSelectEvent = (info: DateSelectInfo) => {
    info.view.calendar.unselect();

    const eventId = crypto.randomUUID();
    setLastAddedEventId(eventId);

    setEvents((prev) => [
      ...prev,
      {
        id: eventId,
        title: item.name,
        start: info.start,
        end: info.end,
        allDay: info.allDay
      }
    ]);
  };

  function handleAddEventRequest(event: EventInput) {}

  async function handleAddReservation(event: EventInput) {
    if (event.start === undefined || event.end === undefined) return;

    const res = await tsr.reservation.addReservation.mutate({
      body: {
        orgId: org.id,
        itemId: item.id,
        event: {
          start: toDate(event.start),
          end: toDate(event.end),
          allDay: !!event.allDay
        }
      }
    });

    if (res.status === 200) {
      toast.add({
        type: 'success',
        title: 'Successfully added item reservation'
      });
    } else {
      toast.add({
        type: 'error',
        title: res.status === 500 ? res.body.message : 'Failed to add item reservation'
      });
    }
  }

  function commitEvent() {
    if (lastAddedEventId === null) return;
    const event = events.find((event) => event.id === lastAddedEventId);
    if (event === undefined) return;
    if (event.start === undefined || event.end === undefined) return;

    setLastAddedEventId(null);

    const difference = hoursBetween(toDate(event.start), toDate(event.end));
    if (difference > MAX_FREE_RESERVE_HOURS) {
      let newEvent: EventInput | null = null;
      setEvents((events) =>
        events.map((item) => {
          if (item.id === lastAddedEventId) {
            return (newEvent = {
              ...item,
              className: PENDING_CLASS_NAME
            });
          }
          return item;
        })
      );

      if (newEvent === null) return;

      handleAddEventRequest(newEvent);
    } else {
      const newEvent = events.find((event) => event.id === lastAddedEventId) ?? null;
      if (newEvent === null) return;
      handleAddReservation(newEvent);
    }
  }

  function filterAddedEvent() {
    if (lastAddedEventId === null) return;
    setEvents((events) => events.filter((event) => event.id !== lastAddedEventId));
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
