import { tsrFactory } from '../../../../../server/tsr-factory';
import { Org } from '../../../../../types/types';
import { OrgMembers } from '../OrgMembers';

type SuperAdminContentsProps = {
  org: Org;
};

export async function SuperAdminContents({ org }: SuperAdminContentsProps) {
  const tsr = await tsrFactory();
  const members = await tsr.organizations.getMembers.query({ params: { orgPath: org.path } });

  return (
    <div>
      <h1 className="text-xl">{org.name}</h1>
      <OrgMembers members={members.status === 200 ? members.body : []} />
    </div>
  );
}
