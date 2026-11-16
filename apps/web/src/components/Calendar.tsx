import FullCalendar, { DateSelectInfo, EventInput } from '@fullcalendar/react';
import themePlugin from '@fullcalendar/react/themes/breezy';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import interactionPlugin from '@fullcalendar/react/interaction';

import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/breezy/theme.css';
import '@fullcalendar/react/themes/breezy/palettes/indigo.css';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

type CalendarProps = React.ComponentProps<'div'>;

export function Calendar(props: CalendarProps) {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [lastAddedEventId, setLastAddedEventId] = useState<string | null>(null);

  const handleSelectEvent = (info: DateSelectInfo) => {
    info.view.calendar.unselect();

    const eventId = crypto.randomUUID();
    setLastAddedEventId(eventId);

    setEvents((prev) => [
      ...prev,
      {
        id: eventId,
        title: 'item reservation',
        start: info.start,
        end: info.end,
        allDay: info.allDay
      }
    ]);
  };

  function commitEvent() {
    if (lastAddedEventId === null) return;
    const event = events.find((event) => event.id === lastAddedEventId);
    if (event === undefined) return;
    if (event.start === undefined || event.end === undefined) return;

    setLastAddedEventId(null);
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
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay'
          }}
        />
      </div>
    </>
  );
}
