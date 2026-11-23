import { Separator } from '../../../../../components/ui/separator';
import { tsrFactory } from '../../../../../server/tsr-factory';
import { Org } from '../../../../../types/types';
import { OrgMemberHandler } from '../OrgMemberHandler';
import { CalendarAndItemsTabGroup } from '../CalendarAndItemsTabGroup';
import { InitOrgs } from '../../../../../stores/client-helpers/InitOrgs';
import { InitItems } from '../../../../../stores/client-helpers/InitItems';
import { groupItems } from '../../../../../utils/utils';

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
  const [userMembersRes, adminMembersRes, itemsRes, orgsRes] = await Promise.all([
    tsr.organizations.getUserMembers.query({
      params: { orgPath: org.path }
    }),
    tsr.organizations.getAdminMembers.query({
      params: { orgPath: org.path }
    }),
    tsr.item.getAll.query(),
    tsr.organizations.getAll.query()
  ]);

  const adminMembers = adminMembersRes.status === 200 ? adminMembersRes.body : [];
  const userMembers = userMembersRes.status === 200 ? userMembersRes.body : [];
  const items = itemsRes.status === 200 ? itemsRes.body : [];
  const orgs = orgsRes.status === 200 ? orgsRes.body : [];

  const groupedItems = groupItems(items);

  return (
    <div className="flex flex-col gap-4 h-full">
      <InitOrgs orgs={orgs} />
      <InitItems items={groupedItems} />

      <h1 className="text-3xl font-medium">{org.name}</h1>
      <OrgMemberHandler org={org} adminMembers={adminMembers} userMembers={userMembers} />
      <Separator className="h-px" />
      <CalendarAndItemsTabGroup org={org} />
    </div>
  );
}
