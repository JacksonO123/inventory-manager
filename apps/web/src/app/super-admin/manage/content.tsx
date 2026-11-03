'use client';

import { TabGroup, Tab, TabContent, Tabs } from '../../../components/Tabs';
import { PartialAdminAndEmail } from '../../../types/types';
import { AdminManage } from './components/AdminManage';
import { useState } from 'react';
import {
  addAdmin,
  addSuperAdmin,
  demoteSuperAdmin,
  promoteAdmin,
  revokeAdmin,
  revokeSuperAdmin,
  validateAdminEmail,
  validateSuperAdminEmail
} from './utils/adminActions';
import { useElementSize } from '@mantine/hooks';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type ContentProps = {
  initialAdmins: PartialAdminAndEmail[];
  initialSuperAdmins: PartialAdminAndEmail[];
};

export default function Content({ initialAdmins, initialSuperAdmins }: ContentProps) {
  const [superAdmins, setSuperAdmins] = useState(initialSuperAdmins);
  const [admins, setAdmins] = useState(initialAdmins);
  const { ref, width } = useElementSize();

  function handleDemote(admin: PartialAdminAndEmail) {
    setAdmins((prev) => [admin, ...prev]);
  }

  function handlePromote(admin: PartialAdminAndEmail) {
    setSuperAdmins((prev) => [admin, ...prev]);
  }

  return (
    <main className="flex justify-center pt-8 px-20">
      <div className="w-full max-w-3xl flex flex-col gap-4">
        <Link href="/super-admin" className="flex gap-2 items-center">
          <ArrowLeft size={18} />
          <span className="underline">Back to dashboard</span>
        </Link>
        <div className="w-full max-w-3xl p-4 rounded-md border">
          <Tabs>
            <TabGroup className="absolute" ref={ref}>
              <Tab value="super-admin">Super Admin</Tab>
              <Tab value="admin">Admin</Tab>
            </TabGroup>
            <div className="min-h-9">
              <TabContent tab="super-admin">
                <AdminManage
                  admins={superAdmins}
                  setAdmins={setSuperAdmins}
                  actionFn={demoteSuperAdmin}
                  revokeFn={revokeSuperAdmin}
                  validateFn={validateSuperAdminEmail}
                  addAdminFn={addSuperAdmin}
                  onActionComplete={handleDemote}
                  adminType="super"
                  tabWidth={width}
                />
              </TabContent>
              <TabContent tab="admin">
                <AdminManage
                  admins={admins}
                  setAdmins={setAdmins}
                  actionFn={promoteAdmin}
                  revokeFn={revokeAdmin}
                  validateFn={validateAdminEmail}
                  addAdminFn={addAdmin}
                  onActionComplete={handlePromote}
                  adminType="regular"
                  tabWidth={width}
                />
              </TabContent>
            </div>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
