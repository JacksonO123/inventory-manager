import { useRef, MouseEvent } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import type { Org as OrgType } from '../../../types/types';
import { cn } from 'cn';
import { Globe, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../../components/ui/dialog';
import Link from 'next/link';

type OrgProps = React.ComponentProps<typeof Card> & {
  org: OrgType;
  editable: boolean;

  onEntryDragStart: (id: number) => void;
  onEntryDragEnd: () => void;
  onEntryHover: () => void;
  onEditClick: () => void;
  onDelete: () => void;
};

export function Org(props: OrgProps) {
  const content = <OrgContent {...props} />;

  return props.editable ? content : <Link href={`/org/${props.org.path}`}>{content}</Link>;
}

export function OrgContent({
  org,
  editable,
  className,
  onEntryDragStart,
  onEntryDragEnd,
  onEntryHover,
  onEditClick,
  onDelete,
  ...others
}: OrgProps) {
  const isDraggingRef = useRef(false);
  const onEntryDragEndRef = useRef(onEntryDragEnd);
  onEntryDragEndRef.current = onEntryDragEnd;

  function handleDragStart(e: MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    onEntryDragStart(org.id);

    function handleWindowMouseUp() {
      isDraggingRef.current = false;
      window.removeEventListener('mouseup', handleWindowMouseUp);
      onEntryDragEndRef.current();
    }

    window.addEventListener('mouseup', handleWindowMouseUp);
  }

  return (
    <Card
      {...others}
      className={cn(
        className,
        !editable &&
          'hover:-translate-y-1 hover:shadow-md duration-150 hover:border-primary/80 cursor-pointer',
        'p-4 h-42 w-92'
      )}
      onMouseEnter={onEntryHover}
    >
      <CardContent className="px-1 flex flex-col gap-2">
        <div className="flex gap-2 w-full justify-between">
          <div className={cn('flex justify-between gap-2 flex-1 min-w-0', editable ? 'pl-4' : '')}>
            <div className="flex gap-4 items-center min-w-0">
              {editable && (
                <div className="absolute -translate-x-7 cursor-grab" onMouseDown={handleDragStart}>
                  <GripVertical className="size-6" />
                </div>
              )}
              <div className="rounded-xl bg-primary/10 min-w-15 min-h-15 w-15 h-15 flex justify-center items-center">
                {org.svgDataUrl ? (
                  <img src={org.svgDataUrl} className="size-6" />
                ) : (
                  <Globe className="size-6" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-medium truncate">{org.name}</h1>
                <p className="text-sm truncate text-muted-foreground">/org/{org.path}</p>
              </div>
            </div>
          </div>
          {editable && (
            <div className="w-fit">
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEditClick();
                }}
              >
                <Pencil />
              </Button>
              <Dialog>
                <DialogTrigger
                  render={
                    <Button size="icon" variant="destructive">
                      <Trash2 />
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>Are you sure you want to delete this org?</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose render={<Button variant="outline">Cancel</Button>} />
                    <DialogClose render={<Button onClick={onDelete}>Delete</Button>} />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
        <p className="p-2">{org.description}</p>
      </CardContent>
    </Card>
  );
}
