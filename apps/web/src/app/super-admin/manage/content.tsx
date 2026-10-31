'use client';

import { TabGroup, Tab, TabContent, Tabs } from '../../../components/Tabs';
import { AdminAndEmail } from '../../../types/types';
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

type ContentProps = {
  initialAdmins: AdminAndEmail[];
  initialSuperAdmins: AdminAndEmail[];
};

export default function Content({ initialAdmins, initialSuperAdmins }: ContentProps) {
  const [superAdmins, setSuperAdmins] = useState(initialSuperAdmins);
  const [admins, setAdmins] = useState(initialAdmins);

  function handleDemote(admin: AdminAndEmail) {
    setAdmins((prev) => [admin, ...prev]);
  }

  function handlePromote(admin: AdminAndEmail) {
    setSuperAdmins((prev) => [admin, ...prev]);
  }

  return (
    <main className="flex justify-center pt-20 px-20">
      <div className="w-full max-w-3xl p-4 rounded-md border">
        <Tabs onTabChange={() => {}}>
          <TabGroup className="absolute">
            <Tab value="super-admin">Super Admin</Tab>
            <Tab value="admin">Admin</Tab>
          </TabGroup>
          <div>
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
              />
            </TabContent>
          </div>
        </Tabs>
      </div>
    </main>
  );
}
