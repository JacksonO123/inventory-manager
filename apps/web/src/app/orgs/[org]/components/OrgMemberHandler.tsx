'use client';

import { useState } from 'react';
import { Org, PartialAdminAndEmail } from '../../../../types/types';
import { OrgMembers } from './OrgMembers';
import { tsr } from '../../../../server/tsr';
import { toast } from '../../../../components/ui/toast';
import { tsrErrorMessage } from '../../../../utils/utils';

type OrgMemberHandlerProps = {
  org: Org;
  adminMembers: PartialAdminAndEmail[];
  userMembers: PartialAdminAndEmail[];
};

export function OrgMemberHandler({
  org,
  adminMembers: defaultAdminMembers,
  userMembers: defaultUserMembers
}: OrgMemberHandlerProps) {
  const [adminMembers, setAdminMembers] = useState(defaultAdminMembers);
  const [userMembers, setUserMembers] = useState(defaultUserMembers);
  const [addAdminMemberOpen, setAddAdminMemberOpen] = useState(false);
  const [addUserMemberOpen, setAddUserMemberOpen] = useState(false);

  async function handleAddAdminMember(email: string) {
    setAdminMembers((prev) => [{ email, userId: '' }, ...prev]);
    setAddAdminMemberOpen(false);

    const res = await tsr.organizations.addAdminMember.mutate({
      params: { orgPath: org.path },
      body: { email }
    });

    if (res.status !== 200) {
      setAdminMembers((prev) => prev.filter((item) => item.email !== email));
      toast.add({
        type: 'error',
        title: tsrErrorMessage(res.body, 'Failed to add member')
      });
    } else {
      setAdminMembers((prev) =>
        prev.map((item) => (item.email === email ? { ...item, userId: res.body.userId } : item))
      );
      toast.add({
        type: 'success',
        title: 'Successfully added member'
      });
    }
  }

  async function handleRemoveAdminMember(userId: string) {
    const before = [...adminMembers];
    setAdminMembers((prev) => prev.filter((member) => member.userId !== userId));

    const res = await tsr.organizations.removeAdminMember.mutate({
      params: { orgPath: org.path },
      body: { userId }
    });

    if (res.status !== 200) {
      setAdminMembers(before);
      toast.add({
        type: 'error',
        title: tsrErrorMessage(res.body, 'Failed to remove member')
      });
    } else {
      toast.add({
        type: 'success',
        title: 'Successfully removed member'
      });
    }
  }

  async function validateNewAdminMember(email: string): Promise<true | string> {
    const isValidMemberRes = await tsr.organizations.isValidNewAdminMember.mutate({
      body: { email, orgPath: org.path }
    });
    return isValidMemberRes.status === 200
      ? isValidMemberRes.body.valid
        ? true
        : isValidMemberRes.body.error !== undefined
          ? isValidMemberRes.body.error
          : 'Not a valid new member'
      : tsrErrorMessage(isValidMemberRes.body, 'Failed to validate new member email');
  }

  async function handleAddUserMember(email: string) {
    setUserMembers((prev) => [{ email, userId: '' }, ...prev]);
    setAddUserMemberOpen(false);

    const res = await tsr.organizations.addUserMember.mutate({
      params: { orgPath: org.path },
      body: { email }
    });

    if (res.status !== 200) {
      setUserMembers((prev) => prev.filter((item) => item.email !== email));
      toast.add({
        type: 'error',
        title: tsrErrorMessage(res.body, 'Failed to add member')
      });
    } else {
      setUserMembers((prev) =>
        prev.map((item) => (item.email === email ? { ...item, userId: res.body.userId } : item))
      );
      toast.add({
        type: 'success',
        title: 'Successfully added member'
      });
    }
  }

  async function handleRemoveUserMember(userId: string) {
    const before = [...userMembers];
    setUserMembers((prev) => prev.filter((member) => member.userId !== userId));

    const res = await tsr.organizations.removeUserMember.mutate({
      params: { orgPath: org.path },
      body: { userId }
    });

    if (res.status !== 200) {
      setUserMembers(before);
      toast.add({
        type: 'error',
        title: tsrErrorMessage(res.body, 'Failed to remove member')
      });
    } else {
      toast.add({
        type: 'success',
        title: 'Successfully removed member'
      });
    }
  }

  async function validateNewUserMember(email: string): Promise<true | string> {
    const isValidMemberRes = await tsr.organizations.isValidNewUserMember.mutate({
      body: { email, orgPath: org.path }
    });
    return isValidMemberRes.status === 200
      ? isValidMemberRes.body.valid
        ? true
        : isValidMemberRes.body.error !== undefined
          ? isValidMemberRes.body.error
          : 'Not a valid new member'
      : tsrErrorMessage(isValidMemberRes.body, 'Failed to validate new member email');
  }

  return (
    <div className="flex flex-wrap gap-4">
      <OrgMembers
        className="flex-1"
        members={adminMembers}
        title="Admins"
        addFormOpen={addAdminMemberOpen}
        memberType="admin"
        setAddFormOpen={setAddAdminMemberOpen}
        onAddMember={handleAddAdminMember}
        onRemoveMember={handleRemoveAdminMember}
        validateNewMember={validateNewAdminMember}
      />
      <OrgMembers
        className="flex-1"
        members={userMembers}
        title="Users"
        addFormOpen={addUserMemberOpen}
        memberType="user"
        setAddFormOpen={setAddUserMemberOpen}
        onAddMember={handleAddUserMember}
        onRemoveMember={handleRemoveUserMember}
        validateNewMember={validateNewUserMember}
      />
    </div>
  );
}
