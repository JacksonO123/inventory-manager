import { ArrowRight, CalendarDays, Clock } from 'lucide-react';
import { ReservationWithBorrowerName } from '../../../../types/types';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  approved: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  rejected: 'bg-red-50 text-red-800 ring-red-600/20',
  cancelled: 'bg-slate-100 text-slate-600 ring-slate-500/20'
};
const FALLBACK_STATUS = 'bg-slate-100 text-slate-700 ring-slate-500/20';

const dayFmt = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric'
});
const timeFmt = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit'
});

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

function formatDuration(start: Date, end: Date, allDay: boolean) {
  if (allDay) {
    const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
    return days <= 1 ? '1 day' : `${days} days`;
  }

  const mins = Math.round((end.getTime() - start.getTime()) / 60_000);

  if (mins < 60) {
    return `${mins} min`;
  }

  if (mins < 60 * 24) {
    const hours = Math.floor(mins / 60);
    const remainderMins = mins % 60;
    return remainderMins ? `${hours}h ${remainderMins}m` : `${hours}h`;
  }

  const days = Math.round(mins / (60 * 24));
  return `${days} day${days === 1 ? '' : 's'}`;
}

export function ReservationRequestCard({ req }: { req: ReservationWithBorrowerName }) {
  const single = sameDay(req.start, req.end);

  return (
    <div className="flex items-start gap-4 rounded-md border p-4">
      <div className="flex w-14 shrink-0 flex-col items-center rounded-md bg-muted py-2 text-center">
        <span className="text-xs text-muted-foreground">
          {req.start.toLocaleString(undefined, { month: 'short' })}
        </span>
        <span className="text-xl font-semibold leading-none">{req.start.getDate()}</span>
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-medium">{req.borrowerName}</h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${
              STATUS_STYLES[req.status] ?? FALLBACK_STATUS
            }`}
          >
            {req.status}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {req.allDay ? (
            <>
              <CalendarDays className="h-4 w-4" />
              {single ? (
                <span>{dayFmt.format(req.start)}, all day</span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  {dayFmt.format(req.start)}
                  <ArrowRight className="h-3.5 w-3.5" />
                  {dayFmt.format(req.end)}
                </span>
              )}
            </>
          ) : single ? (
            <>
              <Clock className="h-4 w-4" />
              <span className="inline-flex items-center gap-1">
                {timeFmt.format(req.start)}
                <ArrowRight className="h-3.5 w-3.5" />
                {timeFmt.format(req.end)}
              </span>
            </>
          ) : (
            <>
              <CalendarDays className="h-4 w-4" />
              <span className="inline-flex items-center gap-1">
                {dayFmt.format(req.start)}, {timeFmt.format(req.start)}
                <ArrowRight className="h-3.5 w-3.5" />
                {dayFmt.format(req.end)}, {timeFmt.format(req.end)}
              </span>
            </>
          )}
          <span aria-hidden>·</span>
          <span>{formatDuration(req.start, req.end, req.allDay)}</span>
        </div>
      </div>
    </div>
  );
}
