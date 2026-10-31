import { Fragment, useId } from 'react';
import { Separator } from '../../../../components/ui/separator';
import { cn } from 'cn';

type AdminEmailListProps = {
  userEmail: string | null;
  admins: { email: string; id: number }[];

  actionRender?: (admin: { email: string; id: number }) => React.ReactNode;
};

export function AdminEmailList({ userEmail, admins, actionRender }: AdminEmailListProps) {
  const listId = useId();

  return (
    <div className="flex flex-col gap-2">
      {admins.map((admin, index) => (
        <Fragment key={`email-${index}-${listId}`}>
          <div className="flex justify-between gap-4 items-center">
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
