import { Fragment, useId } from 'react';
import { Separator } from '../../../../components/ui/separator';
import { cn } from 'cn';
import { PartialAdminAndEmail } from '../../../../types/types';

type AdminEmailListProps = {
  userEmail: string | null;
  admins: PartialAdminAndEmail[];

  actionRender?: (admin: PartialAdminAndEmail) => React.ReactNode;
};

export function AdminEmailList({ userEmail, admins, actionRender }: AdminEmailListProps) {
  const listId = useId();

  return (
    <div className="flex flex-col gap-2">
      {admins.map((admin, index) => (
        <Fragment key={`email-${index}-${listId}`}>
          <div className="flex justify-between gap-4 items-center min-h-7">
            <span className={cn(userEmail === admin.email && 'text-muted-foreground')}>
              {admin.email}
            </span>
            {userEmail !== admin.email && actionRender && (
              <div className="flex gap-2">{actionRender(admin)}</div>
            )}
          </div>
          {index < admins.length - 1 && <Separator className="h-px" />}
        </Fragment>
      ))}
    </div>
  );
}
