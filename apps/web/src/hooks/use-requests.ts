import { useMemo } from 'react';
import { useReservations } from '../stores/reservations';

export function useRequests() {
  const { reservations } = useReservations();
  return useMemo(
    () =>
      Object.values(reservations)
        .flat()
        .filter((reservation) => reservation.status === 'pending'),
    [reservations]
  );
}
