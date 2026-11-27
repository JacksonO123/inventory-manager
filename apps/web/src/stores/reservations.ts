import { create } from 'zustand';
import { Reservation, ReservationWithOptionalBorrowerName } from '../types/types';

type ReservationsState = {
  reservations: Record<number, ReservationWithOptionalBorrowerName[]>;
  tempReservations: { itemId: number; reservation: Reservation } | null;
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
  setTempReservationFor: (itemId: number, reservation: Reservation | null) => void;
  setStatus: (itemId: number, reservationId: string, status: Reservation['status']) => void;
};

export const useReservations = create<ReservationsState & ReservationsActions>((set) => ({
  reservations: [],
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
  setTempReservationFor: (itemId, reservation) =>
    set({ tempReservations: reservation === null ? null : { itemId, reservation } }),
  setStatus: (itemId, reservationId, status) =>
    set((state) => ({
      reservations: {
        ...state.reservations,
        [itemId]:
          state.reservations[itemId]?.map((reservation) =>
            reservation.id === reservationId ? { ...reservation, status } : reservation
          ) ?? []
      }
    }))
}));
