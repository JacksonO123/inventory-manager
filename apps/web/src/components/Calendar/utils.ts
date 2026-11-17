import { DateInput } from '@fullcalendar/react';

export function toDate(input: DateInput): Date {
  return Array.isArray(input)
    ? new Date(...(input as [number, number, number, number, number, number, number]))
    : new Date(input);
}
