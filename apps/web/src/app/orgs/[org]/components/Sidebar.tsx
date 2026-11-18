import { cn } from 'cn';
import { Button } from '../../../../components/ui/button';
import { tsrFactory } from '../../../../server/tsr-factory';
import { Org } from '../../../../types/types';
import { useId } from 'react';
import Link from 'next/link';

type SidebarProps = {
  current: string;
};

export async function Sidebar({ current }: SidebarProps) {
  const sidebarId = useId();

  const tsr = await tsrFactory();
  const orgsRes = await tsr.organizations.getAll.query();
  const orgs: Org[] = orgsRes.status === 200 ? orgsRes.body : [];

  return (
    <div className="h-full w-72 border-r p-4 flex flex-col gap-2">
      {orgs.map((org, index) => (
        <Link href={`/orgs/${org.path}`} key={`org-${index}-${sidebarId}`}>
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              'w-full justify-start hover:bg-primary/20',
              org.path === current && 'bg-primary/15'
            )}
          >
            {org.name}
          </Button>
        </Link>
      ))}
    </div>
  );
}
