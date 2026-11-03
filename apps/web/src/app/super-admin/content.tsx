'use client';

import { Plus, UserRoundShield } from 'lucide-react';
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
};

export function SuperAdminPageContent({ orgs: initialOrgs }: SuperAdminPageContentProps) {
  const [orgs, setOrgs] = useState(initialOrgs);
  const [createOrgOpen, setCreateOrgOpen] = useState(false);

  async function handleCreateOrgSubmit(partialOrg: PartialOrg) {
    setOrgs((prev) => [{ ...partialOrg, id: -1, location: 0 }, ...prev]);
    setCreateOrgOpen(false);
    const res = await tsr.orgRouter.create.mutate({ body: partialOrg });
    if (res.status !== 200) {
      setOrgs((prev) => prev.filter((item) => item.id !== -1));
      toast.add({
        type: 'error',
        title: res.status === 500 ? res.body.message : 'Failed to add org'
      });
    } else {
      setOrgs((prev) =>
        prev.map((item) =>
          item.id === -1 ? { ...item, id: res.body.id, location: res.body.location } : item
        )
      );
      toast.add({
        type: 'success',
        title: 'Successfully added org'
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
          <Link href="/super-admin/manage">
            <Button variant="outline">
              <UserRoundShield /> Manage Admins
            </Button>
          </Link>
        </div>
        <Orgs
          orgs={orgs}
          managing={false}
          onUpdate={() => {}}
          onDelete={() => {}}
          onReorder={() => {}}
        />
      </div>
    </main>
  );
}
