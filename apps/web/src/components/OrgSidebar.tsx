import Link from 'next/link';
import { Org } from '../types/types';
import { useId } from 'react';
import { Button } from './ui/button';
import { cn } from 'cn';

type OrgSidebar = {
  orgs: Org[];
  current: string;
};

export function OrgSidebar({ orgs, current }: OrgSidebar) {
  const sidebarId = useId();

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
