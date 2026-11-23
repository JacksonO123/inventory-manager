import { create } from 'zustand';
import { ReservationWithOptionalBorrowerName } from '../types/types';

type ReservationsState = {
  reservations: ReservationWithOptionalBorrowerName[];
};

type ReservationsActions = {
  setReservations: (reservations: ReservationWithOptionalBorrowerName[]) => void;
};

export const useReservations = create<ReservationsState & ReservationsActions>((set) => ({
  reservations: [],
  setReservations: (reservations) => set({ reservations })
}));
