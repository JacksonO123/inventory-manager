'use client';

import { TabGroup, Tab, TabContent, Tabs } from '../../../components/Tabs';
import { Admin, AdminAndEmail, SuperAdmin, SuperAdminAndEmail } from '../../../types/types';
import { SuperAdminManage } from './components/SuperAdminManage';
import { AdminManage } from './components/AdminManage';
import { useState } from 'react';

type ContentProps = {
  initialAdmins: (Admin & { email: string })[];
  initialSuperAdmins: (SuperAdmin & { email: string })[];
};

export default function Content({ initialAdmins, initialSuperAdmins }: ContentProps) {
  const [superAdmins, setSuperAdmins] = useState(initialSuperAdmins);
  const [admins, setAdmins] = useState(initialAdmins);

  function handleDemote(superAdmin: SuperAdminAndEmail) {
    const regularAdmin: AdminAndEmail = superAdmin;
    setAdmins((prev) => [regularAdmin, ...prev]);
  }

  function handlePromote(regularAdmin: AdminAndEmail) {
    const superAdmin: SuperAdminAndEmail = regularAdmin;
    setSuperAdmins((prev) => [superAdmin, ...prev]);
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
              <SuperAdminManage
                superAdmins={superAdmins}
                setSuperAdmins={setSuperAdmins}
                onDemote={handleDemote}
              />
            </TabContent>
            <TabContent tab="admin">
              <AdminManage admins={admins} setAdmins={setAdmins} onPromote={handlePromote} />
            </TabContent>
          </div>
        </Tabs>
      </div>
    </main>
  );
}
