'use client';

import { Pencil, UserRoundShield, X } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { useState } from 'react';
import Link from 'next/link';
import { CreateOrgButton } from '../../../../components/CreateOrgButton';
import { Orgs } from '../../../../components/Orgs';
import { useOrgCrud } from '../../../../hooks/use-org-crud';

export function SuperAdminContent() {
  const [editing, setEditing] = useState(false);
  const { createOrg, setOrgPositions, updateOrg, deleteOrg } = useOrgCrud();

  return (
    <div className="h-full flex flex-col gap-8">
      <div className="flex justify-between gap-4 p-3 rounded-md border">
        <CreateOrgButton onCreate={createOrg} />
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
        onUpdate={updateOrg}
        onDelete={deleteOrg}
        onReorder={setOrgPositions}
      />
    </div>
  );
}
