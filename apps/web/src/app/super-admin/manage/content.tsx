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
import { useElementSize, useLocalStorage } from '@mantine/hooks';
import { BackLink } from '../../../components/BackLink';

type ContentProps = {
  initialAdmins: PartialAdminAndEmail[];
  initialSuperAdmins: PartialAdminAndEmail[];
};

export default function Content({ initialAdmins, initialSuperAdmins }: ContentProps) {
  const [superAdmins, setSuperAdmins] = useState(initialSuperAdmins);
  const [admins, setAdmins] = useState(initialAdmins);
  const [tab, setTab] = useLocalStorage<string | null>({
    key: 'manage-admins-tab-group-state',
    defaultValue: null
  });
  const { ref, width } = useElementSize();

  function handleDemote(admin: PartialAdminAndEmail) {
    setAdmins((prev) => [admin, ...prev]);
  }

  function handlePromote(admin: PartialAdminAndEmail) {
    setSuperAdmins((prev) => [admin, ...prev]);
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div>
        <BackLink href="/">Dashboard</BackLink>
      </div>
      <div className="w-full p-4 rounded-md border">
        <Tabs tab={tab} onTabChange={setTab}>
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
  );
}
