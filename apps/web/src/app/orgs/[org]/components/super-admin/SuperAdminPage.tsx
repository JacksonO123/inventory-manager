import { tsrFactory } from '../../../../../server/tsr-factory';
import { Org } from '../../../../../types/types';
import { SuperAdminContent } from '../OrgMemberHandler';

type SuperAdminPageProps = {
  org: Org;
};

export const dynamic = 'force-dynamic';

export async function SuperAdminPage({ org }: SuperAdminPageProps) {
  const tsr = await tsrFactory();
  const [userMembers, adminMembers] = await Promise.all([
    tsr.organizations.getUserMembers.query({
      params: { orgPath: org.path }
    }),
    tsr.organizations.getAdminMembers.query({
      params: { orgPath: org.path }
    })
  ]);

  console.log('HERE 2', userMembers);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-medium">{org.name}</h1>
      <SuperAdminContent
        org={org}
        adminMembers={adminMembers.status === 200 ? adminMembers.body : []}
        userMembers={userMembers.status === 200 ? userMembers.body : []}
      />
    </div>
  );
}
