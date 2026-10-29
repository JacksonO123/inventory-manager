import { Fragment, useId } from 'react';
import { Separator } from '../../../../components/ui/separator';
import { Button } from '../../../../components/ui/button';

type AdminEmailListProps = {
  admins: { email: string; id: number }[];

  actionRender: (id: number) => React.ReactNode;
  onRevoke: (id: number) => void;
};

export function AdminEmailList({ admins, onRevoke, actionRender }: AdminEmailListProps) {
  const listId = useId();

  return (
    <div className="flex flex-col gap-2">
      {admins.map((admin, index) => (
        <Fragment key={`email-${index}-${listId}`}>
          <div className="flex justify-between gap-4 items-center">
            <span>{admin.email}</span>
            <div className="flex gap-2">
              {actionRender(admin.id)}
              <Button variant="destructive" size="sm" onClick={() => onRevoke(admin.id)}>
                Revoke
              </Button>
            </div>
          </div>
          {index < admins.length - 1 && <Separator className="h-px" />}
        </Fragment>
      ))}
    </div>
  );
}
