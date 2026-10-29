import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Plus } from 'lucide-react';
import { NewAdminForm } from '../../../../components/NewAdminForm';
import { SuperAdminAndEmail } from '../../../../types/types';
import { tsr } from '../../../../server/tsr';
import { toast } from '../../../../components/ui/toast';
import { AdminEmailList } from './AdminList';
import { Input } from '../../../../components/ui/input';

type SuperAdminManageProps = {
  superAdmins: SuperAdminAndEmail[];
  setSuperAdmins: (
    superAdmins: SuperAdminAndEmail[] | ((prev: SuperAdminAndEmail[]) => SuperAdminAndEmail[])
  ) => void;

  onDemote: (admin: SuperAdminAndEmail) => void;
};

export function SuperAdminManage({ superAdmins, setSuperAdmins, onDemote }: SuperAdminManageProps) {
  const [superAdminOpen, setSuperAdminOpen] = useState(false);
  const [emailFilter, setEmailFilter] = useState('');

  const filteredAdmins = useMemo(() => {
    return superAdmins.filter((admin) =>
      emailFilter.trim().length > 0 ? admin.email.includes(emailFilter.trim()) : true
    );
  }, [superAdmins, emailFilter]);

  async function handleCheckValidSuperAdminEmail(email: string) {
    const res = await tsr.superAdmin.isValidSuperAdminEmail.mutate({ body: { email } });
    if (res.status !== 200) return 'Validation error';
    if (res.body.status === 'no_user_exists') return 'Given email is not an existing user';
    if (res.body.status === 'super_admin_exists') return 'Already a super admin';

    return true;
  }

  async function handleAddSuperAdmin(email: string) {
    setSuperAdmins((prev) => [...prev, { email, user_id: '', id: -1 }]);
    setSuperAdminOpen(false);
    const res = await tsr.superAdmin.addSuperAdmin.mutate({ body: { email } });
    if (res.status !== 200) {
      setSuperAdmins((prev) => prev.filter((item) => item.id === -1));

      if (res.status === 500 || res.status === 401) {
        toast.add({
          type: 'Error',
          title: res.body.message
        });
      }
    }
  }

  async function handleRevokeEmail(id: number) {
    let before = [...superAdmins];
    setSuperAdmins((prev) => prev.filter((admin) => admin.id !== id));

    const res = await tsr.superAdmin.revokeAdmin.mutate({ body: { id } });
    if (res.status !== 200) {
      setSuperAdmins(before);

      if (res.status === 500 || res.status === 401) {
        toast.add({
          type: 'error',
          title: res.body.message
        });
      }
    }
  }

  async function handleDemote(id: number) {
    let before = [...superAdmins];
    const demoted = superAdmins.find((item) => item.id === id);
    setSuperAdmins((prev) => prev.filter((admin) => admin.id !== id));

    const res = await tsr.superAdmin.demote.mutate({ body: { id } });
    if (res.status !== 200) {
      setSuperAdmins(before);

      if (res.status === 500 || res.status === 401) {
        toast.add({
          type: 'error',
          title: res.body.message
        });
      }
    } else if (demoted !== undefined) {
      onDemote(demoted);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex justify-end gap-4">
        <Input
          className="max-w-2xs"
          placeholder="Filter email"
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
        />
        <Dialog open={superAdminOpen} onOpenChange={setSuperAdminOpen}>
          <DialogTrigger
            render={
              <Button>
                Add super admin <Plus />
              </Button>
            }
          />
          <DialogContent className="max-w-md! w-md!" showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>
                Enter email of new <span className="text-primary font-bold">super admin</span>
              </DialogTitle>
            </DialogHeader>
            <NewAdminForm
              onCancel={() => setSuperAdminOpen(false)}
              onSubmit={handleAddSuperAdmin}
              externalValidator={handleCheckValidSuperAdminEmail}
            />
          </DialogContent>
        </Dialog>
      </div>
      {filteredAdmins.length > 0 && (
        <AdminEmailList
          admins={filteredAdmins}
          onRevoke={handleRevokeEmail}
          actionRender={(id) => (
            <Button variant="outline" size="sm" onClick={() => handleDemote(id)}>
              Demote
            </Button>
          )}
        />
      )}
    </div>
  );
}
