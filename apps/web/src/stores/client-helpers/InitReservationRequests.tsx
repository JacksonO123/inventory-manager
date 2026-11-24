'use client';

import { useEffect } from 'react';
import { ReservationWithBorrowerName } from '../../types/types';
import { useReservations } from '../reservations';

type InitReservationRequestsProps = {
  requests: Record<number, ReservationWithBorrowerName[]>;
};

export function InitReservationRequests({ requests }: InitReservationRequestsProps) {
  const { setRequests } = useReservations();

  useEffect(() => {
    setRequests(requests);
  }, []);

  return null;
}
