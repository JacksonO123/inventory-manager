import { OrgSidebar } from '../../../../../components/OrgSidebar';

type SidebarProps = {
  current: string;
};

export function AdminSidebar({ current }: SidebarProps) {
  return <OrgSidebar current={current} />;
}
