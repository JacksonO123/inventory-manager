import { tsrFactory } from '../../../../../server/tsr-factory';
import { Org } from '../../../../../types/types';
import { OrgSidebar } from '../../../../../components/OrgSidebar';

type SidebarProps = {
  current: string;
};

export async function AdminSidebar({ current }: SidebarProps) {
  const tsr = await tsrFactory();
  const orgsRes = await tsr.organizations.getOrgsForAdmin.query();
  const orgs: Org[] = orgsRes.status === 200 ? orgsRes.body : [];

  return <OrgSidebar orgs={orgs} current={current} />;
}
