import { useReservations } from '../stores/reservations';
import { Reservation, ReservationWithOptionalBorrowerName } from '../types/types';

export function useReservationsFor(itemId: number) {
  const storedReservations = useReservations((state) => state.reservations[itemId]);
  const reservations = storedReservations ?? [];

  const storedTempReservation = useReservations((state) => state.tempReservations);
  const tempReservation =
    storedTempReservation !== null
      ? storedTempReservation.itemId === itemId
        ? storedTempReservation.reservation
        : null
      : null;

  const setReservationsFor = useReservations((state) => state.setReservationsFor);
  const setTempReservationFor = useReservations((state) => state.setTempReservationFor);

  function handleSetReservations(
    reservations:
      | ReservationWithOptionalBorrowerName[]
      | ((
          reservations: ReservationWithOptionalBorrowerName[]
        ) => ReservationWithOptionalBorrowerName[])
  ) {
    setReservationsFor(itemId, (currentReservations) =>
      typeof reservations === 'function' ? reservations(currentReservations) : reservations
    );
  }

  function handleSetTempReservation(reservation: Reservation | null) {
    setTempReservationFor(itemId, reservation);
  }

  function handleAddReservation(reservation: Reservation) {
    handleSetReservations((currentReservations) => [...currentReservations, reservation]);
  }

  return {
    reservations,
    tempReservation,
    setReservations: handleSetReservations,
    setTempReservation: handleSetTempReservation,
    addReservation: handleAddReservation
  };
}
