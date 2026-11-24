import { toast } from '../components/ui/toast';
import { tsrErrorMessage } from '../utils/utils';
import { Reservation, ReservationWithOptionalBorrowerName, ServerErrorRes } from '../types/types';
import { tsr } from '../server/tsr';
import { useReservationsFor } from './use-reservations-for';
import { useReservations } from '../stores/reservations';

export function useReservationCrudForItem(orgId: number, itemId: number) {
  const { tempReservation, addReservation, setTempReservation, setReservations } =
    useReservationsFor(itemId);

  async function handleAddReservation(
    reservation: Reservation,
    borrowerId: string
  ): Promise<ServerErrorRes<string>> {
    const res = await tsr.reservation.addReservation.mutate({
      body: {
        orgId: orgId,
        itemId: itemId,
        borrowerId,
        event: reservation
      }
    });

    if (res.status === 200) {
      if (tempReservation !== null) {
        const newReservation = { ...tempReservation, id: res.body.id };
        addReservation(newReservation);
        setTempReservation(null);
      }

      toast.add({
        type: 'success',
        title: 'Successfully added item reservation'
      });
      return { status: 'success', body: res.body.id };
    }

    toast.add({
      type: 'error',
      title: tsrErrorMessage(res.body, 'Failed to add item reservation')
    });

    return { status: 'error' };
  }

  async function fetchReservationsBetweenDates(start: Date, end: Date) {
    const fetched = await tsr.reservation.getByItemIdAndOrgPathBetweenDates.mutate({
      params: { orgId: orgId, itemId: itemId },
      body: { start, end }
    });
    if (fetched.status !== 200) {
      toast.add({
        type: 'error',
        title: 'Failed to fetch reservations for calendar'
      });
      return;
    }

    const fetchedReservations = fetched.body;

    setReservations((prev) =>
      Object.values(
        [...prev, ...fetchedReservations].reduce(
          (acc, curr) => {
            acc[curr.id] = curr;
            return acc;
          },
          {} as Record<string, ReservationWithOptionalBorrowerName>
        )
      )
    );
  }

  return { addReservation: handleAddReservation, fetchReservationsBetweenDates };
}

export function useReservationCrudForOrg(orgId: number) {
  const { setReservations } = useReservations();

  function dedupeReservations(reservations: Reservation[]) {
    return Object.values(
      reservations.reduce(
        (acc, curr) => {
          acc[curr.itemId] = curr;
          return acc;
        },
        {} as Record<number, Reservation>
      )
    );
  }

  async function fetchReservationsBetweenDates(start: Date, end: Date) {
    const fetched = await tsr.reservation.getOrgIdBetweenDates.mutate({
      params: { orgId: orgId },
      body: { start, end }
    });
    if (fetched.status !== 200) {
      toast.add({
        type: 'error',
        title: 'Failed to fetch reservations for calendar'
      });
      return;
    }

    const fetchedReservations = fetched.body;

    setReservations((prev) => {
      for (const reservation of fetchedReservations) {
        const arr = prev[reservation.itemId] ?? [];
        arr.push(reservation);
        prev[reservation.itemId] = dedupeReservations(arr);
      }
      return { ...prev };
    });
  }

  return { fetchReservationsBetweenDates };
}
