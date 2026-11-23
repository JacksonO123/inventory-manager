import { SuperAdminSidebarContents } from './SuperAdminSidebarContents';

type SidebarProps = {
  current: string;
};

export async function SuperAdminSidebar({ current }: SidebarProps) {
  return <SuperAdminSidebarContents current={current} />;
}
