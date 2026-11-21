import { Plus } from 'lucide-react';
import { CreateOrgForm } from './Orgs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useState } from 'react';
import { PartialOrg } from '../types/types';
import { Button } from './ui/button';

type CreateOrgButtonProps = {
  onCreate: (org: PartialOrg) => void;
};

export function CreateOrgButton({ onCreate }: CreateOrgButtonProps) {
  const [createOrgOpen, setCreateOrgOpen] = useState(false);

  return (
    <Dialog open={createOrgOpen} onOpenChange={setCreateOrgOpen}>
      <DialogTrigger
        suppressHydrationWarning
        render={
          <Button>
            <Plus /> Create Org
          </Button>
        }
      />
      <DialogContent className="max-w-md!">
        <DialogHeader>
          <DialogTitle>Create organization</DialogTitle>
        </DialogHeader>
        <CreateOrgForm
          onSubmit={(org) => {
            onCreate(org);
            setCreateOrgOpen(false);
          }}
          onCancel={() => setCreateOrgOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
