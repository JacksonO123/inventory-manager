'use client';

import { Pencil, UserRoundShield, X } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { useState } from 'react';
import { Org, PartialOrg } from '../../../../types/types';
import { tsr } from '../../../../server/tsr';
import { toast } from '../../../../components/ui/toast';
import Link from 'next/link';
import { CreateOrgButton } from '../../../../components/CreateOrgButton';
import { Orgs } from '../../../../components/Orgs';
import { tsrErrorMessage } from '../../../../utils/utils';
import { useOrgPositions, useOrgs } from '../../../../stores/orgs';

export function SuperAdminContent() {
  const { orgs, setOrgs } = useOrgs();
  const { positions, setPositions } = useOrgPositions();
  const [editing, setEditing] = useState(false);

  async function handleCreateOrgSubmit(partialOrg: PartialOrg) {
    setOrgs((prev) => [{ ...partialOrg, id: -1 }, ...prev]);
    setPositions((prev) => [-1, ...prev]);
    const res = await tsr.organizations.create.mutate({ body: partialOrg });
    if (res.status !== 200) {
      setOrgs((prev) => prev.filter((item) => item.id !== -1));
      setPositions((prev) => prev.filter((item) => item !== -1));
      toast.add({
        type: 'error',
        title: tsrErrorMessage(res.body, 'Failed to add org')
      });
    } else {
      setOrgs((prev) => prev.map((item) => (item.id === -1 ? { ...item, id: res.body.id } : item)));
      setPositions((prev) => prev.map((item) => (item === -1 ? res.body.id : item)));
      toast.add({
        type: 'success',
        title: 'Successfully added org'
      });
    }
  }

  async function handleSetOrgPositions(newOrder: number[]) {
    const prevOrder = [...positions];
    setPositions(newOrder);

    const res = await tsr.organizations.setPositions.mutate({
      body: { positions: newOrder }
    });
    if (res.status !== 200) {
      setPositions(prevOrder);
      toast.add({
        type: 'error',
        title: tsrErrorMessage(res.body, 'Failed to reorder orgs')
      });
    } else {
      toast.add({
        type: 'success',
        title: 'Successfully reordered orgs'
      });
    }
  }

  async function handleUpdateOrg(updatedOrg: Org) {
    const prevOrg = orgs.find((org) => org.id === updatedOrg.id);
    if (!prevOrg) return;

    setOrgs((prev) => prev.map((org) => (org.id === updatedOrg.id ? updatedOrg : org)));

    const res = await tsr.organizations.update.mutate({ body: updatedOrg });
    if (res.status !== 200) {
      setOrgs((prev) => prev.map((org) => (org.id === prevOrg.id ? prevOrg : org)));
      toast.add({
        type: 'error',
        title: tsrErrorMessage(res.body, 'Failed to update org')
      });
    } else {
      toast.add({
        type: 'success',
        title: 'Successfully updated org'
      });
    }
  }

  async function handleDeleteOrg(id: number) {
    const prevOrgs = [...orgs];
    setOrgs((prev) => prev.filter((org) => org.id !== id));

    const res = await tsr.organizations.delete.mutate({ body: { id } });
    if (res.status !== 200) {
      setOrgs(prevOrgs);
      toast.add({
        type: 'error',
        title: tsrErrorMessage(res.body, 'Failed to delete org')
      });
    } else {
      toast.add({
        type: 'success',
        title: 'Successfully deleted org'
      });
    }
  }

  return (
    <div className="h-full flex flex-col gap-8">
      <div className="flex justify-between gap-4 p-3 rounded-md border">
        <CreateOrgButton onCreate={handleCreateOrgSubmit} />
        <div className="flex gap-4">
          {editing ? (
            <Button variant="outline" onClick={() => setEditing(false)}>
              <X /> Cancel
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil /> Edit orgs
            </Button>
          )}
          <Link href="/super-admin/manage">
            <Button variant="outline">
              <UserRoundShield /> Manage Admins
            </Button>
          </Link>
        </div>
      </div>
      <Orgs
        managing={editing}
        onUpdate={handleUpdateOrg}
        onDelete={handleDeleteOrg}
        onReorder={handleSetOrgPositions}
      />
    </div>
  );
}
