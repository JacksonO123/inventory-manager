import { Separator } from '../../../../../components/ui/separator';
import { tsrFactory } from '../../../../../server/tsr-factory';
import { Org } from '../../../../../types/types';
import { SuperAdminContent } from '../OrgMemberHandler';
import { SuperAdminTabGroup } from './SuperAdminTabGroup';

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
  const [userMembers, adminMembers, items] = await Promise.all([
    tsr.organizations.getUserMembers.query({
      params: { orgPath: org.path }
    }),
    tsr.organizations.getAdminMembers.query({
      params: { orgPath: org.path }
    }),
    tsr.item.getItemsFromOrgPathWithReservationsBetweenDates.mutate({
      params: { orgPath: org.path },
      body: {
        start: dayStart,
        end: dayEnd
      }
    })
  ]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <h1 className="text-3xl font-medium">{org.name}</h1>
      <SuperAdminContent
        org={org}
        adminMembers={adminMembers.status === 200 ? adminMembers.body : []}
        userMembers={userMembers.status === 200 ? userMembers.body : []}
      />
      <Separator className="h-px" />
      <SuperAdminTabGroup org={org} items={items.status === 200 ? items.body : []} />
    </div>
  );
}
