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

export function Calendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [currentSelected, setCurrentSelected] = useState<DateSelectInfo | null>(null);

  const completeReservation = () => {
    if (!currentSelected) return;

    currentSelected.view.calendar.unselect();

    setEvents((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: 'item reservation',
        start: currentSelected.start,
        end: currentSelected.end,
        allDay: currentSelected.allDay
      }
    ]);
    setCurrentSelected(null);
  };

  return (
    <>
      <Dialog open={currentSelected !== null}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm reservation?</DialogTitle>
            <div className="flex gap-4">
              <Button onClick={completeReservation} className="flex-1">
                Yes
              </Button>
              <Button onClick={() => setCurrentSelected(null)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div onWheel={(e) => console.log('here', e)}>
        <FullCalendar
          plugins={[themePlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          selectable={true}
          selectMirror={true}
          select={setCurrentSelected}
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
