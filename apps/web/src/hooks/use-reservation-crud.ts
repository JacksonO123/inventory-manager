import { toast } from '../components/ui/toast';
import { dedupeReservations, tsrErrorMessage } from '../utils/utils';
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
  const { setReservations, setStatus } = useReservations();

  async function fetchReservationsBetweenDates(start: Date, end: Date) {
    const fetched = await tsr.reservation.getWithOrgIdBetweenDates.mutate({
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
      const fetchedByItem: Record<number, ReservationWithOptionalBorrowerName[]> = {};
      for (const reservation of fetchedReservations) {
        (fetchedByItem[reservation.itemId] ??= []).push(reservation);
      }

      const next: Record<number, ReservationWithOptionalBorrowerName[]> = { ...prev };
      for (const [itemId, itemReservations] of Object.entries(fetchedByItem)) {
        const id = Number(itemId);
        next[id] = dedupeReservations([...(next[id] ?? []), ...itemReservations]);
      }
      return next;
    });
  }

  async function accept(itemId: number, reservationId: string) {
    setStatus(itemId, reservationId, 'accepted');

    const res = await tsr.reservation.accept.mutate({
      body: {
        itemId,
        reservationId: Number(reservationId)
      }
    });

    if (res.status !== 200) {
      setStatus(itemId, reservationId, 'pending');
      toast.add({
        type: 'error',
        title: tsrErrorMessage(res.body, 'Failed to accept reservation')
      });
    } else {
      toast.add({
        type: 'success',
        title: 'Successfully accepted reservation'
      });
    }
  }

  async function reject(itemId: number, reservationId: string) {
    setStatus(itemId, reservationId, 'canceled');

    const res = await tsr.reservation.reject.mutate({
      body: {
        itemId,
        reservationId: Number(reservationId)
      }
    });

    if (res.status !== 200) {
      setStatus(itemId, reservationId, 'pending');
      toast.add({
        type: 'error',
        title: tsrErrorMessage(res.body, 'Failed to reject reservation')
      });
    } else {
      toast.add({
        type: 'success',
        title: 'Successfully reject reservation'
      });
    }
  }

  return { fetchReservationsBetweenDates, accept, reject };
}
