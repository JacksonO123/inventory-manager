import { tsrFactory } from '../../../../../server/tsr-factory';
import { Org } from '../../../../../types/types';
import { OrgMembers } from '../OrgMembers';

type SuperAdminContentsProps = {
  org: Org;
};

export const dynamic = 'force-dynamic';

export async function SuperAdminContents({ org }: SuperAdminContentsProps) {
  const tsr = await tsrFactory();
  const members = await tsr.organizations.getMembers.query({ params: { orgPath: org.path } });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-medium">{org.name}</h1>
      <OrgMembers members={members.status === 200 ? members.body : []} orgPath={org.path} />
    </div>
  );
}
