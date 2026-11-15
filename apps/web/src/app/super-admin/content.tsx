'use client';

import { Pencil, Plus, UserRoundShield, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../components/ui/dialog';
import { CreateOrgForm } from './components/CreateOrgForm';
import Link from 'next/link';
import { Orgs } from './components/Orgs';
import { Org, PartialOrg } from '../../types/types';
import { tsr } from '../../server/tsr';
import { useState } from 'react';
import { toast } from '../../components/ui/toast';

type SuperAdminPageContentProps = {
  orgs: Org[];
  positions: number[];
};

export function SuperAdminPageContent({
  orgs: initialOrgs,
  positions: initialOrgPositions
}: SuperAdminPageContentProps) {
  const [orgs, setOrgs] = useState(initialOrgs);
  const [orgPositions, setOrgPositions] = useState([
    ...initialOrgPositions,
    ...orgs.filter((item) => !initialOrgPositions.includes(item.id)).map((item) => item.id)
  ]);
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  async function handleCreateOrgSubmit(partialOrg: PartialOrg) {
    setOrgs((prev) => [{ ...partialOrg, id: -1 }, ...prev]);
    setOrgPositions((prev) => [-1, ...prev]);
    setCreateOrgOpen(false);
    const res = await tsr.organizations.create.mutate({ body: partialOrg });
    if (res.status !== 200) {
      setOrgs((prev) => prev.filter((item) => item.id !== -1));
      setOrgPositions((prev) => prev.filter((item) => item !== -1));
      toast.add({
        type: 'error',
        title: res.status === 500 ? res.body.message : 'Failed to add org'
      });
    } else {
      setOrgs((prev) => prev.map((item) => (item.id === -1 ? { ...item, id: res.body.id } : item)));
      setOrgPositions((prev) => prev.map((item) => (item === -1 ? res.body.id : item)));
      toast.add({
        type: 'success',
        title: 'Successfully added org'
      });
    }
  }

  async function handleSetOrgPositions(newOrder: number[]) {
    const prevOrder = [...orgPositions];
    setOrgPositions(newOrder);

    const res = await tsr.organizations.setPositions.mutate({
      body: { positions: newOrder }
    });
    if (res.status !== 200) {
      setOrgPositions(prevOrder);
      toast.add({
        type: 'error',
        title: res.status === 500 ? res.body.message : 'Failed to reorder orgs'
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
        title: res.status === 500 ? res.body.message : 'Failed to update org'
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
        title: res.status === 500 ? res.body.message : 'Failed to delete org'
      });
    } else {
      toast.add({
        type: 'success',
        title: 'Successfully deleted org'
      });
    }
  }

  return (
    <main className="flex justify-center pt-8 px-20">
      <div className="w-full max-w-5xl flex flex-col gap-8">
        <div className="flex justify-between gap-4 p-3 rounded-md border">
          <Dialog open={createOrgOpen} onOpenChange={setCreateOrgOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Plus /> Create org
                </Button>
              }
            />
            <DialogContent className="max-w-md!">
              <DialogHeader>
                <DialogTitle>Create organization</DialogTitle>
              </DialogHeader>
              <CreateOrgForm
                onSubmit={handleCreateOrgSubmit}
                onCancel={() => setCreateOrgOpen(false)}
              />
            </DialogContent>
          </Dialog>
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
          orgs={orgs}
          managing={editing}
          positions={orgPositions}
          onUpdate={handleUpdateOrg}
          onDelete={handleDeleteOrg}
          onReorder={handleSetOrgPositions}
        />
      </div>
    </main>
  );
}
