'use client';

import { OrgSidebar } from '../../../../../components/OrgSidebar';
import { PartialOrg } from '../../../../../types/types';
import { tsr } from '../../../../../server/tsr';
import { toast } from '../../../../../components/ui/toast';
import { tsrErrorMessage } from '../../../../../utils/utils';
import { useOrgs } from '../../../../../stores/orgs';

type SuperAdminSidebarContentsProps = {
  current: string;
};

export function SuperAdminSidebarContents({ current }: SuperAdminSidebarContentsProps) {
  const { orgs, setOrgs } = useOrgs();

  async function handleCreateOrgSubmit(partialOrg: PartialOrg) {
    setOrgs((prev) => [{ ...partialOrg, id: -1 }, ...prev]);

    const res = await tsr.organizations.create.mutate({ body: partialOrg });

    if (res.status !== 200) {
      setOrgs((prev) => prev.filter((item) => item.id !== -1));
      toast.add({
        type: 'error',
        title: tsrErrorMessage(res.body, 'Failed to add org')
      });
    } else {
      setOrgs((prev) => prev.map((item) => (item.id === -1 ? { ...item, id: res.body.id } : item)));
      toast.add({
        type: 'success',
        title: 'Successfully added org'
      });
    }
  }

  function handleEditSubmit() {}

  return (
    <OrgSidebar
      orgs={orgs}
      current={current}
      onCreateOrg={handleCreateOrgSubmit}
      onEditSubmit={handleEditSubmit}
    />
  );
}
