'use client';

import { useEffect } from 'react';
import { ReservationWithOptionalBorrowerName } from '../../types/types';
import { useReservations } from '../reservations';

type InitReservationsProps = {
  reservations: Record<number, ReservationWithOptionalBorrowerName[]>;
};

export function InitReservations({ reservations }: InitReservationsProps) {
  const { setReservations } = useReservations();

  useEffect(() => {
    setReservations(reservations);
  }, []);

  return null;
}
