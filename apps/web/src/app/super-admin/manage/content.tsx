'use client';

import { TabGroup, Tab, TabContent, Tabs } from '../../../components/Tabs';
import { tsr } from '../../../server/tsr';
import { AdminAndEmail, ServerErrorRes } from '../../../types/types';
import { AdminManage } from './components/AdminManage';
import { useState } from 'react';

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

  async function validateSuperAdminEmail(email: string): Promise<true | string> {
    const res = await tsr.superAdmin.isValidSuperAdminEmail.mutate({ body: { email } });
    if (res.status !== 200) return 'Validation error';
    if (res.body.status === 'no_user_exists') return 'Given email is not an existing user';
    if (res.body.status === 'super_admin_exists') return 'Already a super admin';

    return true;
  }

  async function validateAdminEmail(email: string): Promise<true | string> {
    const res = await tsr.superAdmin.isValidAdminEmail.mutate({ body: { email } });
    if (res.status !== 200) return 'Validation error';
    if (res.body.status === 'no_user_exists') return 'Given email is not an existing user';
    if (res.body.status === 'admin_exists') return 'Already an admin';

    return true;
  }

  async function revokeSuperAdmin(id: number): Promise<ServerErrorRes> {
    const res = await tsr.superAdmin.revokeAdmin.mutate({ body: { id } });
    if (res.status === 500 || res.status === 401) {
      return { error: res.body.message };
    } else if (res.status !== 200) {
      return { error: undefined };
    }

    return null;
  }

  async function addSuperAdmin(email: string): Promise<ServerErrorRes> {
    const res = await tsr.superAdmin.addSuperAdmin.mutate({ body: { email } });
    if (res.status === 500 || res.status === 401) {
      return { error: res.body.message };
    } else if (res.status !== 200) {
      return { error: undefined };
    }

    return null;
  }

  async function addAdmin(email: string): Promise<ServerErrorRes> {
    const res = await tsr.admin.addAdmin.mutate({ body: { email } });
    if (res.status === 500 || res.status === 401) {
      return { error: res.body.message };
    } else if (res.status !== 200) {
      return { error: undefined };
    }

    return null;
  }

  async function demoteSuperAdmin(id: number): Promise<ServerErrorRes> {
    const res = await tsr.superAdmin.demote.mutate({ body: { id } });
    if (res.status === 500 || res.status === 401) {
      return { error: res.body.message };
    } else if (res.status !== 200) {
      return { error: undefined };
    }

    return null;
  }

  async function promoteAdmin(id: number): Promise<ServerErrorRes> {
    const res = await tsr.admin.promote.mutate({ body: { id } });
    if (res.status === 500 || res.status === 401) {
      return { error: res.body.message };
    } else if (res.status !== 200) {
      return { error: undefined };
    }

    return null;
  }

  async function revokeAdmin(id: number): Promise<ServerErrorRes> {
    const res = await tsr.superAdmin.revokeAdmin.mutate({ body: { id } });
    if (res.status === 500 || res.status === 401) {
      return { error: res.body.message };
    } else if (res.status !== 200) {
      return { error: undefined };
    }

    return null;
  }

  function handleStartDemote(id: number) {}

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

                onActionStart={handleStartDemote}
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
