'use client';

import Link from 'next/link';
import { Org, PartialOrg } from '../types/types';
import { useId, useState } from 'react';
import { Button } from './ui/button';
import { cn } from 'cn';
import { CreateOrgButton } from './CreateOrgButton';
import { EllipsisVertical, Pencil, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { CreateOrgForm } from './Orgs';
import { useOrgs } from '../stores/orgs';

type OrgSidebar = {
  current: string;
  onCreateOrg?: (org: PartialOrg) => void;
  onEditSubmit?: (org: Org) => void;
  onDelete?: (id: number) => void;
};

export function OrgSidebar({ current, onCreateOrg, onEditSubmit, onDelete }: OrgSidebar) {
  const { orgs } = useOrgs();
  const sidebarId = useId();

  return (
    <div className="h-full w-72 border-r p-4 flex flex-col gap-2">
      {onCreateOrg && <CreateOrgButton onCreate={onCreateOrg} className="h-9" />}
      {orgs.map((org, index) => (
        <SidebarLink
          key={`org-${index}-${sidebarId}`}
          org={org}
          current={org.path === current}
          onEditSubmit={onEditSubmit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

type SidebarLinkProps = {
  org: Org;
  current: boolean;
  onEditSubmit?: (org: Org) => void;
  onDelete?: (id: number) => void;
};

function SidebarLink({ org, current, onEditSubmit, onDelete }: SidebarLinkProps) {
  const [hovering, setHovering] = useState(false);
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);

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
              <DropdownMenuItem
                variant="destructive"
                className="flex justify-between"
                onClick={() => {
                  setRemoving(true);
                  setHovering(false);
                }}
              >
                Remove
                <Trash />
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Dialog open={removing} onOpenChange={setRemoving}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>Are you sure you want to delete this org?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <DialogClose
              render={
                <Button onClick={() => onDelete?.(org.id)} variant="destructive">
                  Delete
                </Button>
              }
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
