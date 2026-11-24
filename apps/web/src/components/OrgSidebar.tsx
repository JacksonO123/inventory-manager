'use client';

import Link from 'next/link';
import { Org, PartialOrg } from '../types/types';
import { useId, useState } from 'react';
import { Button } from './ui/button';
import { cn } from 'cn';
import { CreateOrgButton } from './CreateOrgButton';
import { EllipsisVertical, Pencil } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { Dialog, DialogContent } from './ui/dialog';
import { CreateOrgForm } from './Orgs';
import { useOrgs } from '../stores/orgs';

type OrgSidebar = {
  current: string;
  onCreateOrg?: (org: PartialOrg) => void;
  onEditSubmit?: (org: Org) => void;
};

export function OrgSidebar({ current, onCreateOrg, onEditSubmit }: OrgSidebar) {
  const { orgs } = useOrgs();
  const sidebarId = useId();

  return (
    <div className="h-full w-72 border-r p-4 flex flex-col gap-2">
      {onCreateOrg && <CreateOrgButton onCreate={onCreateOrg} />}
      {orgs.map((org, index) => (
        <SidebarLink
          key={`org-${index}-${sidebarId}`}
          org={org}
          current={org.path === current}
          onEditSubmit={onEditSubmit}
        />
      ))}
    </div>
  );
}

type SidebarLinkProps = {
  org: Org;
  current: boolean;
  onEditSubmit?: (org: Org) => void;
};

function SidebarLink({ org, current, onEditSubmit }: SidebarLinkProps) {
  const [hovering, setHovering] = useState(false);
  const [editing, setEditing] = useState(false);

  return (
    <div
      className={cn(
        'group/button relative flex w-full items-center justify-between gap-1.5 rounded-lg',
        'h-9 pl-2.5 pr-1',
        'duration-150 hover:bg-primary/20',
        current && 'bg-primary/10'
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <Link
        href={`/orgs/${org.path}`}
        className={cn(
          "inline-flex flex-1 items-center rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer h-full"
        )}
      >
        <span>{org.name}</span>
      </Link>

      {onEditSubmit && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  'size-7 rounded-full hover:bg-black/15',
                  hovering ? 'opacity-100' : 'opacity-0'
                )}
              >
                <EllipsisVertical className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="flex justify-between"
                onClick={() => {
                  setEditing(true);
                  setHovering(false);
                }}
              >
                Edit
                <Pencil />
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <CreateOrgForm
            defaultValues={org}
            onCancel={() => setEditing(false)}
            onSubmit={(updatedOrg) => {
              onEditSubmit?.({ ...updatedOrg, id: org.id });
              setEditing(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
