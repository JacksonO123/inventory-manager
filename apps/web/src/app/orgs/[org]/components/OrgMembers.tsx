'use client';

import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NewAdminForm } from '../../../../components/NewAdminForm';
import { Button } from '../../../../components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../../../components/ui/dialog';
import { PartialAdminAndEmail } from '../../../../types/types';
import { Card, CardContent, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { AdminEmailList } from '../../../../components/AdminEmailList';
import { cn } from 'cn';

type OrgMembersProps = React.ComponentProps<typeof Card> & {
  members: PartialAdminAndEmail[];
  title: string;
  addFormOpen: boolean;
  memberType: 'user' | 'admin';

  setAddFormOpen: (open: boolean) => void;
  onAddMember: (email: string) => void;
  onRemoveMember: (userId: string) => void;
  validateNewMember: (email: string) => Promise<true | string>;
};

export function OrgMembers({
  title,
  members,
  addFormOpen,
  memberType,
  setAddFormOpen,
  onAddMember,
  onRemoveMember,
  validateNewMember,
  className,
  ...props
}: OrgMembersProps) {
  const [emailFilter, setEmailFilter] = useState('');
  const memberName = memberType === 'admin' ? 'Admin' : 'User';

  const filteredMembers = useMemo(() => {
    return members.filter((admin) =>
      emailFilter.trim().length > 0 ? admin.email.includes(emailFilter.trim()) : true
    );
  }, [members, emailFilter]);

  return (
    <Card className={cn(className, 'w-full')} {...props}>
      <CardContent className="flex flex-col gap-4">
        <div className="flex justify-between gap-4">
          <CardTitle>{title}</CardTitle>
          <div className="flex gap-4">
            <Input
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              placeholder="Filter email"
              className="max-w-xs"
            />
            <Dialog open={addFormOpen} onOpenChange={setAddFormOpen}>
              <DialogTrigger
                render={
                  <Button>
                    <Plus /> Add {memberName}
                  </Button>
                }
              />
              <DialogContent className="max-w-md! w-md!" showCloseButton={false}>
                <DialogHeader>
                  <DialogTitle>
                    Enter email of new{' '}
                    <span className="text-primary font-bold">org {memberName}</span>
                  </DialogTitle>
                </DialogHeader>
                <NewAdminForm
                  onCancel={() => setAddFormOpen(false)}
                  onSubmit={onAddMember}
                  externalValidator={validateNewMember}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <AdminEmailList
          userEmail=""
          admins={filteredMembers}
          actionRender={(member) => (
            <Dialog>
              <DialogTrigger
                render={
                  <Button variant="destructive" size="sm">
                    Remove
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove member?</DialogTitle>
                  <DialogDescription>
                    This will remove {member.email} from the organization.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-4 w-full">
                  <DialogClose
                    render={
                      <Button variant="outline" className="flex-1">
                        Cancel
                      </Button>
                    }
                  />
                  <DialogClose
                    render={
                      <Button
                        className="flex-1"
                        variant="destructive"
                        onClick={() => onRemoveMember(member.userId)}
                      >
                        Yes
                      </Button>
                    }
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        />
      </CardContent>
    </Card>
  );
}
