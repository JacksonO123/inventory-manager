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
import { AdminAndEmail, ServerErrorRes } from '../../../../types/types';
import { Button } from '../../../../components/ui/button';
import { AdminEmailList } from './AdminList';
import { Input } from '../../../../components/ui/input';

type AdminManageProps = {
  admins: AdminAndEmail[];
  setAdmins: (admins: AdminAndEmail[] | ((prev: AdminAndEmail[]) => AdminAndEmail[])) => void;

  validateFn: (email: string) => Promise<true | string>;
  actionFn: (id: number) => Promise<ServerErrorRes>;
  revokeFn: (id: number) => Promise<ServerErrorRes>;
  addAdminFn: (email: string) => Promise<ServerErrorRes>;

  onActionComplete: (admin: AdminAndEmail) => void;

  adminType: 'super' | 'regular';
};

export function AdminManage({
  admins,
  adminType,
  setAdmins,
  actionFn,
  validateFn,
  revokeFn,
  addAdminFn,
  onActionComplete
}: AdminManageProps) {
  const [adminOpen, setAdminOpen] = useState(false);
  const [emailFilter, setEmailFilter] = useState('');

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) =>
      emailFilter.trim().length > 0 ? admin.email.includes(emailFilter.trim()) : true
    );
  }, [admins, emailFilter]);

  async function handleAddAdmin(email: string) {
    setAdmins((prev) => [{ email, user_id: '', id: -1 }, ...prev]);
    setAdminOpen(false);

    const error = await addAdminFn(email);
    if (error !== null) {
      setAdmins((prev) => prev.filter((item) => item.id === -1));

      if (error.error !== undefined) {
        toast.add({
          type: 'Error',
          title: error.error
        });
      }
    }
  }

  async function handleRevokeEmail(id: number) {
    let before = [...admins];
    setAdmins((prev) => prev.filter((admin) => admin.id !== id));

    const error = await revokeFn(id);
    if (error !== null) {
      setAdmins(before);

      if (error.error !== undefined) {
        toast.add({
          type: 'error',
          title: error.error
        });
      }
    }
  }

  async function handleAction(id: number) {
    let before = [...admins];
    const actionTarget = admins.find((item) => item.id === id);
    setAdmins((prev) => prev.filter((admin) => admin.id !== id));

    const error = await actionFn(id);
    if (error !== null) {
      setAdmins(before);

      if (error.error !== undefined) {
        toast.add({
          type: 'error',
          title: error.error
        });
      }
    } else if (actionTarget) {
      onActionComplete(actionTarget);
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
                Add {adminType === 'super' ? 'super admin' : 'admin'} <Plus />
              </Button>
            }
          />
          <DialogContent className="max-w-md! w-md!" showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>
                Enter email of new{' '}
                <span className="text-primary font-bold">
                  {adminType === 'super' ? 'super admin' : 'admin'}
                </span>
              </DialogTitle>
            </DialogHeader>
            <NewAdminForm
              onCancel={() => setAdminOpen(false)}
              onSubmit={handleAddAdmin}
              externalValidator={validateFn}
            />
          </DialogContent>
        </Dialog>
      </div>
      {filteredAdmins.length > 0 && (
        <AdminEmailList
          admins={filteredAdmins}
          onRevoke={handleRevokeEmail}
          actionRender={(id) => (
            <Button variant="outline" size="sm" onClick={() => handleAction(id)}>
              {adminType === 'regular' ? 'Promote' : 'Demote'}
            </Button>
          )}
        />
      )}
    </div>
  );
}
