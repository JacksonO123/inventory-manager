import { tsrFactory } from '../../../../../server/tsr-factory';
import { InitItems } from '../../../../../stores/client-helpers/InitItems';
import { InitOrgs } from '../../../../../stores/client-helpers/InitOrgs';
import { InitReservations } from '../../../../../stores/client-helpers/InitReservations';
import { Org, ReservationWithOptionalBorrowerName } from '../../../../../types/types';
import { extractBodyOrDefault, groupItems } from '../../../../../utils/utils';
import { CalendarAndItemsTabGroup } from '../CalendarAndItemsTabGroup';

type AdminContentsProps = {
  org: Org;
};

export async function AdminPage({ org }: AdminContentsProps) {
  const tsr = await tsrFactory();
  const [itemsRes, reservationsReq] = await Promise.all([
    tsr.organizations.getInfoForAdmin.query(),
    tsr.reservation.getWithOrgPath.query({ params: { orgPath: org.path } })
  ]);

  const info = extractBodyOrDefault(itemsRes, []);
  const groupedItems = groupItems(info);
  const reservations = extractBodyOrDefault(reservationsReq, []);
  const groupedReservations = reservations.reduce(
    (acc, curr) => {
      const arr = acc[curr.itemId] ?? [];
      arr.push(curr);
      acc[curr.itemId] = arr;
      return acc;
    },
    {} as Record<number, ReservationWithOptionalBorrowerName[]>
  );

  return (
    <>
      <InitItems items={groupedItems} />
      <InitOrgs orgs={info.map((entry) => entry.org)} />
      <InitReservations reservations={groupedReservations} />
      <CalendarAndItemsTabGroup org={org} />
    </>
  );
}
