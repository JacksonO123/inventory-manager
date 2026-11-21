'use client';

import { useState } from 'react';
import { OrgSidebar } from '../../../../../components/OrgSidebar';
import { Org, PartialOrg } from '../../../../../types/types';
import { tsr } from '../../../../../server/tsr';
import { toast } from '../../../../../components/ui/toast';

type SuperAdminSidebarContentsProps = {
  orgs: Org[];
  current: string;
};

export function SuperAdminSidebarContents({
  orgs: defaultOrgs,
  current
}: SuperAdminSidebarContentsProps) {
  const [orgs, setOrgs] = useState(defaultOrgs);

  async function handleCreateOrgSubmit(partialOrg: PartialOrg) {
    setOrgs((prev) => [{ ...partialOrg, id: -1 }, ...prev]);

    const res = await tsr.organizations.create.mutate({ body: partialOrg });

    if (res.status !== 200) {
      setOrgs((prev) => prev.filter((item) => item.id !== -1));
      toast.add({
        type: 'error',
        title: res.status === 500 ? res.body.message : 'Failed to add org'
      });
    } else {
      setOrgs((prev) => prev.map((item) => (item.id === -1 ? { ...item, id: res.body.id } : item)));
      toast.add({
        type: 'success',
        title: 'Successfully added org'
      });
    }
  }

  return <OrgSidebar orgs={orgs} current={current} onCreateOrg={handleCreateOrgSubmit} />;
}
