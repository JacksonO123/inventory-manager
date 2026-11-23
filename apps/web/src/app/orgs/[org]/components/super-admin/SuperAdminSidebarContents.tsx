'use client';

import { OrgSidebar } from '../../../../../components/OrgSidebar';
import { useOrgCrud } from '../../../../../hooks/use-org-crud';

type SuperAdminSidebarContentsProps = {
  current: string;
};

export function SuperAdminSidebarContents({ current }: SuperAdminSidebarContentsProps) {
  const { createOrg, updateOrg } = useOrgCrud();
  return <OrgSidebar current={current} onCreateOrg={createOrg} onEditSubmit={updateOrg} />;
}
