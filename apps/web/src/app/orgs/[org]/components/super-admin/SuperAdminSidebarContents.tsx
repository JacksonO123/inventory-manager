'use client';

import { redirect } from 'next/navigation';
import { OrgSidebar } from '../../../../../components/OrgSidebar';
import { useOrgCrud } from '../../../../../hooks/use-org-crud';
import { useOrgs } from '../../../../../stores/orgs';

type SuperAdminSidebarContentsProps = {
  current: string;
};

export function SuperAdminSidebarContents({ current }: SuperAdminSidebarContentsProps) {
  const { orgs } = useOrgs();
  const { createOrg, updateOrg, deleteOrg } = useOrgCrud();

  function handleRemoveOrg(id: number) {
    const org = orgs.find((org) => org.id === id);
    const afterOrgLen = org !== undefined ? orgs.length - 1 : orgs.length;
    deleteOrg(id);

    if (!org) return;
    if (current === org.path) {
      if (afterOrgLen > 0) {
        redirect(`/orgs/${orgs[0]!.path}`);
      } else {
        redirect('/');
      }
    }
  }

  return (
    <OrgSidebar
      current={current}
      onCreateOrg={createOrg}
      onEditSubmit={updateOrg}
      onDelete={handleRemoveOrg}
    />
  );
}
