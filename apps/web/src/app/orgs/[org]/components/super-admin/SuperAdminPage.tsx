import { Separator } from '../../../../../components/ui/separator';
import { tsrFactory } from '../../../../../server/tsr-factory';
import { Org, ReservationWithBorrowerName } from '../../../../../types/types';
import { OrgMemberHandler } from '../OrgMemberHandler';
import { CalendarAndItemsTabGroup } from '../CalendarAndItemsTabGroup';
import { InitOrgs } from '../../../../../stores/client-helpers/InitOrgs';
import { InitItems } from '../../../../../stores/client-helpers/InitItems';
import { extractBodyOrDefault, groupItems } from '../../../../../utils/utils';
import { InitReservationRequests } from '../../../../../stores/client-helpers/InitReservationRequests';

type SuperAdminPageProps = {
  org: Org;
};

export const dynamic = 'force-dynamic';

export async function SuperAdminPage({ org }: SuperAdminPageProps) {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayStart.getDate() + 1);

  const tsr = await tsrFactory();
  const [userMembersRes, adminMembersRes, itemsRes, orgsRes, reservationRequestsRes] =
    await Promise.all([
      tsr.organizations.getUserMembers.query({
        params: { orgPath: org.path }
      }),
      tsr.organizations.getAdminMembers.query({
        params: { orgPath: org.path }
      }),
      tsr.item.getAll.query(),
      tsr.organizations.getAll.query(),
      tsr.reservation.getReservationRequestsForOrg.query({ params: { orgPath: org.path } })
    ]);

  const adminMembers = extractBodyOrDefault(adminMembersRes, []);
  const userMembers = extractBodyOrDefault(userMembersRes, []);
  const items = extractBodyOrDefault(itemsRes, []);
  const orgs = extractBodyOrDefault(orgsRes, []);
  const requests = extractBodyOrDefault(reservationRequestsRes, []);

  const groupedItems = groupItems(items);
  const groupedRequests = requests.reduce(
    (acc, curr) => {
      acc[curr.itemId] = curr.reservations;
      return acc;
    },
    {} as Record<number, ReservationWithBorrowerName[]>
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      <InitOrgs orgs={orgs} />
      <InitItems items={groupedItems} />
      <InitReservationRequests requests={groupedRequests} />

      <h1 className="text-3xl font-medium">{org.name}</h1>
      <OrgMemberHandler org={org} adminMembers={adminMembers} userMembers={userMembers} />
      <Separator className="h-px" />
      <CalendarAndItemsTabGroup org={org} />
    </div>
  );
}
