import { tsrFactory } from '../../../../../server/tsr-factory';
import { Org } from '../../../../../types/types';
import { SuperAdminSidebarContents } from './SuperAdminSidebarContents';

type SidebarProps = {
  current: string;
};

export async function SuperAdminSidebar({ current }: SidebarProps) {
  const tsr = await tsrFactory();
  const orgsRes = await tsr.organizations.getAll.query();
  const orgs: Org[] = orgsRes.status === 200 ? orgsRes.body : [];

  return <SuperAdminSidebarContents orgs={orgs} current={current} />;
}
