import { tsrFactory } from '../../../../../server/tsr-factory';
import { InitItems } from '../../../../../stores/client-helpers/InitItems';
import { InitOrgs } from '../../../../../stores/client-helpers/InitOrgs';
import { InitReservationRequests } from '../../../../../stores/client-helpers/InitReservationRequests';
import { Org, ReservationWithBorrowerName } from '../../../../../types/types';
import { extractBodyOrDefault, groupItems } from '../../../../../utils/utils';
import { CalendarAndItemsTabGroup } from '../CalendarAndItemsTabGroup';

type AdminContentsProps = {
  org: Org;
};

export async function AdminPage({ org }: AdminContentsProps) {
  const tsr = await tsrFactory();
  const [itemsRes, reservationRequestsReq] = await Promise.all([
    tsr.organizations.getInfoForAdmin.query(),
    tsr.reservation.getReservationRequestsForOrg.query({ params: { orgPath: org.path } })
  ]);

  const info = extractBodyOrDefault(itemsRes, []);
  const groupedItems = groupItems(info);
  const reservationRequests = extractBodyOrDefault(reservationRequestsReq, []);
  const groupedRequests = reservationRequests.reduce(
    (acc, curr) => {
      acc[curr.itemId] = curr.reservations;
      return acc;
    },
    {} as Record<number, ReservationWithBorrowerName[]>
  );

  return (
    <>
      <InitItems items={groupedItems} />
      <InitOrgs orgs={info.map((entry) => entry.org)} />
      <InitReservationRequests requests={groupedRequests} />
      <CalendarAndItemsTabGroup org={org} />
    </>
  );
}
