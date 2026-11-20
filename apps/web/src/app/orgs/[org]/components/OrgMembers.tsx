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
import { toast } from '../../../../components/ui/toast';
import { tsr } from '../../../../server/tsr';
import { PartialAdminAndEmail } from '../../../../types/types';
import { Card, CardContent } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { AdminEmailList } from '../../../../components/AdminEmailList';

type OrgMembersProps = {
  members: PartialAdminAndEmail[];
  orgPath: string;
};

export function OrgMembers({ members: defaultMembers, orgPath }: OrgMembersProps) {
  const [members, setMembers] = useState(defaultMembers);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [emailFilter, setEmailFilter] = useState('');

  const filteredMembers = useMemo(() => {
    return members.filter((admin) =>
      emailFilter.trim().length > 0 ? admin.email.includes(emailFilter.trim()) : true
    );
  }, [members, emailFilter]);

  async function handleAddMember(email: string) {
    setMembers((prev) => [{ email, userId: '' }, ...prev]);
    setAddMemberOpen(false);

    const res = await tsr.organizations.addMember.mutate({
      params: { orgPath },
      body: { email }
    });

    if (res.status !== 200) {
      setMembers((prev) => prev.filter((item) => item.email !== email));
      toast.add({
        type: 'error',
        title: res.status === 500 ? res.body.message : 'Failed to add member'
      });
    } else {
      setMembers((prev) =>
        prev.map((item) => (item.email === email ? { ...item, userId: res.body.userId } : item))
      );
      toast.add({
        type: 'success',
        title: 'Successfully added member'
      });
    }
  }

  async function handleRemoveMember(userId: string) {
    const before = [...members];
    setMembers((prev) => prev.filter((member) => member.userId !== userId));

    const res = await tsr.organizations.removeMember.mutate({
      params: { orgPath },
      body: { userId }
    });

    if (res.status !== 200) {
      setMembers(before);
      toast.add({
        type: 'error',
        title: res.status === 500 ? res.body.message : 'Failed to remove member'
      });
    } else {
      toast.add({
        type: 'success',
        title: 'Successfully removed member'
      });
    }
  }

  async function validateNewMember(email: string): Promise<true | string> {
    const isValidMemberRes = await tsr.organizations.isValidNewMember.mutate({
      body: { email, orgPath }
    });
    return isValidMemberRes.status === 200
      ? isValidMemberRes.body.valid
        ? true
        : isValidMemberRes.body.error !== undefined
          ? isValidMemberRes.body.error
          : 'Not a valid new member'
      : isValidMemberRes.status === 500
        ? isValidMemberRes.body.message
        : 'Failed to validate new member email';
  }

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col gap-4">
        <div className="flex justify-between gap-4">
          <Input
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            placeholder="Filter email"
            className="max-w-xs"
          />
          <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Plus /> Add member
                </Button>
              }
            />
            <DialogContent className="max-w-md! w-md!" showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>
                  Enter email of new <span className="text-primary font-bold">org member</span>
                </DialogTitle>
              </DialogHeader>
              <NewAdminForm
                onCancel={() => setAddMemberOpen(false)}
                onSubmit={handleAddMember}
                externalValidator={validateNewMember}
              />
            </DialogContent>
          </Dialog>
        </div>

        {filteredMembers.length > 0 && (
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
                          onClick={() => handleRemoveMember(member.userId)}
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
        )}
      </CardContent>
    </Card>
  );
}
