'use client';

import Link from 'next/link';
import { Org, PartialOrg } from '../types/types';
import { useId } from 'react';
import { Button } from './ui/button';
import { cn } from 'cn';
import { CreateOrgButton } from './CreateOrgButton';
import { Pencil } from 'lucide-react';

type OrgSidebar = {
  orgs: Org[];
  current: string;
  onCreateOrg?: (org: PartialOrg) => void;
  onEditSubmit?: () => void;
};

export function OrgSidebar({ orgs, current, onCreateOrg, onEditSubmit }: OrgSidebar) {
  const sidebarId = useId();

  return (
    <div className="h-full w-72 border-r p-4 flex flex-col gap-2">
      {onCreateOrg && <CreateOrgButton onCreate={onCreateOrg} />}
      {orgs.map((org, index) => (
        <Link
          href={`/orgs/${org.path}`}
          key={`org-${index}-${sidebarId}`}
          className={cn(
            "group/button inline-flex shrink-0 items-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
            'h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
            'duration-150 w-full justify-between hover:bg-primary/20 pr-1',
            org.path === current && 'bg-primary/10'
          )}
        >
          <span>{org.name}</span>
          {onEditSubmit && (
            <Button
              size="icon"
              variant="ghost"
              className="size-7 rounded-full hover:bg-black/15"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onEditSubmit?.();
              }}
            >
              <Pencil className="size-3.5" />
            </Button>
          )}
        </Link>
      ))}
    </div>
  );
}
