import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NewAdminForm } from '../../../../components/NewAdminForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../../../components/ui/dialog';
import { toast } from '../../../../components/ui/toast';
import { tsr } from '../../../../server/tsr';
import { AdminAndEmail } from '../../../../types/types';
import { Button } from '../../../../components/ui/button';
import { AdminEmailList } from './AdminList';
import { Input } from '../../../../components/ui/input';

type AdminManageProps = {
  admins: AdminAndEmail[];
  setAdmins: (admins: AdminAndEmail[] | ((prev: AdminAndEmail[]) => AdminAndEmail[])) => void;

  onPromote: (admin: AdminAndEmail) => void;
};

export function AdminManage({ admins, setAdmins, onPromote }: AdminManageProps) {
  const [adminOpen, setAdminOpen] = useState(false);
  const [emailFilter, setEmailFilter] = useState('');

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) =>
      emailFilter.trim().length > 0 ? admin.email.includes(emailFilter.trim()) : true
    );
  }, [admins, emailFilter]);

  async function handleCheckValidAdminEmail(email: string) {
    const res = await tsr.superAdmin.isValidSuperAdminEmail.mutate({ body: { email } });
    if (res.status !== 200) return 'Validation error';
    if (res.body.status === 'no_user_exists') return 'Given email is not an existing user';
    if (res.body.status === 'super_admin_exists') return 'Already a super admin';

    return true;
  }

  async function handleAddAdmin(email: string) {
    setAdmins((prev) => [...prev, { email, user_id: '', id: -1 }]);
    setAdminOpen(false);
    const res = await tsr.admin.addAdmin.mutate({ body: { email } });
    if (res.status !== 200) {
      setAdmins((prev) => prev.filter((item) => item.id === -1));

      if (res.status === 500 || res.status === 401) {
        toast.add({
          type: 'Error',
          title: res.body.message
        });
      }
    }
  }

  async function handleRevokeEmail(id: number) {
    let before = [...admins];
    setAdmins((prev) => prev.filter((admin) => admin.id !== id));

    const res = await tsr.admin.revokeAdmin.mutate({ body: { id } });
    if (res.status !== 200) {
      setAdmins(before);

      if (res.status === 500 || res.status === 401) {
        toast.add({
          type: 'error',
          title: res.body.message
        });
      }
    }
  }

  async function handlePromote(id: number) {
    let before = [...admins];
    const promoted = admins.find((item) => item.id === id);
    setAdmins((prev) => prev.filter((admin) => admin.id !== id));

    const res = await tsr.admin.promote.mutate({ body: { id } });
    if (res.status !== 200) {
      setAdmins(before);

      if (res.status === 500 || res.status === 401) {
        toast.add({
          type: 'error',
          title: res.body.message
        });
      }
    } else if (promoted) {
      onPromote(promoted);
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
        <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
          <DialogTrigger
            render={
              <Button>
                Add admin <Plus />
              </Button>
            }
          />
          <DialogContent className="max-w-md! w-md!" showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>
                Enter email of new <span className="text-primary font-bold">admin</span>
              </DialogTitle>
            </DialogHeader>
            <NewAdminForm
              onCancel={() => setAdminOpen(false)}
              onSubmit={handleAddAdmin}
              externalValidator={handleCheckValidAdminEmail}
            />
          </DialogContent>
        </Dialog>
      </div>
      {filteredAdmins.length > 0 && (
        <AdminEmailList
          admins={filteredAdmins}
          onRevoke={handleRevokeEmail}
          actionRender={(id) => (
            <Button variant="outline" size="sm" onClick={() => handlePromote(id)}>
              Promote
            </Button>
          )}
        />
      )}
    </div>
  );
}
