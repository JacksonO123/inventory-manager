import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NewAdminForm } from '../../../../components/NewAdminForm';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../../../components/ui/dialog';
import { toast } from '../../../../components/ui/toast';
import { AdminAndEmail, ServerErrorRes } from '../../../../types/types';
import { Button } from '../../../../components/ui/button';
import { AdminEmailList } from './AdminList';
import { Input } from '../../../../components/ui/input';
import { authClient } from '../../../../client/auth-client';

type AdminManageProps = {
  admins: AdminAndEmail[];
  setAdmins: (admins: AdminAndEmail[] | ((prev: AdminAndEmail[]) => AdminAndEmail[])) => void;

  adminType: 'super' | 'regular';
  tabWidth: number;

  validateFn: (email: string) => Promise<true | string>;
  actionFn: (id: number) => Promise<ServerErrorRes<{ id: number }>>;
  revokeFn: (id: number) => Promise<ServerErrorRes>;
  addAdminFn: (email: string) => Promise<ServerErrorRes<{ id: number }>>;

  onActionComplete: (admin: AdminAndEmail) => void;
};

export function AdminManage({
  admins,
  adminType,
  tabWidth,
  setAdmins,
  actionFn,
  validateFn,
  revokeFn,
  addAdminFn,
  onActionComplete
}: AdminManageProps) {
  const session = authClient.useSession();
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

    const result = await addAdminFn(email);
    if (result.status === 'error') {
      setAdmins((prev) => prev.filter((item) => item.id === -1));

      if (result.error !== undefined) {
        toast.add({
          type: 'error',
          title: result.error
        });
      }
    } else {
      setAdmins((prev) =>
        prev.map((item) => (item.id === -1 ? { ...item, id: result.body.id } : item))
      );
      toast.add({
        type: 'success',
        title: 'Admin added successfully'
      });
    }
  }

  async function handleRevokeEmail(id: number) {
    let before = [...admins];
    setAdmins((prev) => prev.filter((admin) => admin.id !== id));

    const result = await revokeFn(id);
    if (result.status === 'error') {
      setAdmins(before);

      if (result.error !== undefined) {
        toast.add({
          type: 'error',
          title: result.error
        });
      }
    } else {
      toast.add({
        type: 'success',
        title: 'Admin revoked successfully'
      });
    }
  }

  async function handleAction(id: number) {
    let before = [...admins];
    const actionTarget = admins.find((item) => item.id === id);
    setAdmins((prev) => prev.filter((admin) => admin.id !== id));

    const result = await actionFn(id);
    if (result.status === 'error') {
      setAdmins(before);

      if (result.error !== undefined) {
        toast.add({
          type: 'error',
          title: result.error
        });
      }
    } else if (actionTarget) {
      const correctedIdAdmin = { ...actionTarget, id: result.body.id };
      onActionComplete(correctedIdAdmin);
      toast.add({
        type: 'success',
        title: `Admin ${adminType === 'regular' ? 'promoted' : 'demoted'} successfully`
      });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex-1 flex gap-4 flex-wrap">
        <div className="h-9" style={{ minWidth: `${tabWidth}px` }} />
        <div className="flex-1 flex gap-4 justify-end">
          <Input
            className="max-w-2xs min-w-20"
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
      </div>
      {filteredAdmins.length > 0 && (
        <AdminEmailList
          userEmail={session.data?.user.email ?? null}
          admins={filteredAdmins}
          actionRender={({ email, id }) => (
            <>
              <Dialog>
                <DialogTrigger
                  render={
                    <Button variant="outline" size="sm" disabled={session.isPending}>
                      {adminType === 'regular' ? 'Promote' : 'Demote'}
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      {adminType === 'regular'
                        ? `This action will grant super admin privileges to ${email}`
                        : `This action will remove super admin privileges from ${email}`}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-4 w-full">
                    <DialogClose
                      render={
                        <Button variant="outline" className="flex-1">
                          Cancel
                        </Button>
                      }
                    />
                    <DialogClose
                      render={
                        <Button className="flex-1" onClick={() => handleAction(id)}>
                          Yes
                        </Button>
                      }
                    />
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger
                  render={
                    <Button variant="destructive" size="sm" disabled={session.isPending}>
                      Revoke
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>This action is not reversible</DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-4 w-full">
                    <DialogClose
                      render={
                        <Button variant="outline" className="flex-1">
                          Cancel
                        </Button>
                      }
                    />
                    <DialogClose
                      render={
                        <Button className="flex-1" onClick={() => handleRevokeEmail(id)}>
                          Yes
                        </Button>
                      }
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        />
      )}
    </div>
  );
}
