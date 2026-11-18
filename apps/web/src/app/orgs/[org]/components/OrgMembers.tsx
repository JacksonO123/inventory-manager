'use client';

import { useState } from 'react';
import { PartialAdminAndEmail } from '../../../../types/types';

type OrgMembersProps = {
  members: PartialAdminAndEmail[];
};

export function OrgMembers({ members: defaultMembers }: OrgMembersProps) {
  const [members, setMembers] = useState(defaultMembers);

  return <div>{members.map((member) => member.email)}</div>;
}
