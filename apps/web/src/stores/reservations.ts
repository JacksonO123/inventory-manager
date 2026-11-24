import { create } from 'zustand';
import {
  Reservation,
  ReservationWithBorrowerName,
  ReservationWithOptionalBorrowerName
} from '../types/types';

type ReservationsState = {
  reservations: Record<number, ReservationWithOptionalBorrowerName[]>;
  tempReservations: { itemId: number; reservation: Reservation } | null;
  requests: Record<number, ReservationWithBorrowerName[]>;
};

type ReservationsActions = {
  setReservations: (
    reservations:
      | Record<number, ReservationWithOptionalBorrowerName[]>
      | ((
          reservations: Record<number, ReservationWithOptionalBorrowerName[]>
        ) => Record<number, ReservationWithOptionalBorrowerName[]>)
  ) => void;
  setReservationsFor: (
    itemId: number,
    reservations:
      | ReservationWithOptionalBorrowerName[]
      | ((
          reservations: ReservationWithOptionalBorrowerName[]
        ) => ReservationWithOptionalBorrowerName[])
  ) => void;
  setRequests: (requests: Record<number, ReservationWithBorrowerName[]>) => void;
  setTempReservationFor: (itemId: number, reservation: Reservation | null) => void;
};

export const useReservations = create<ReservationsState & ReservationsActions>((set) => ({
  reservations: [],
  requests: [],
  tempReservations: null,
  setReservations: (reservations) =>
    set((state) => ({
      reservations:
        typeof reservations === 'function' ? reservations(state.reservations) : reservations
    })),
  setReservationsFor: (itemId, reservations) =>
    set((state) => ({
      reservations: {
        ...state.reservations,
        [itemId]:
          typeof reservations === 'function'
            ? reservations(state.reservations[itemId] ?? [])
            : reservations
      }
    })),
  setRequests: (requests) => set({ requests }),
  setTempReservationFor: (itemId, reservation) =>
    set({ tempReservations: reservation === null ? null : { itemId, reservation } })
}));
