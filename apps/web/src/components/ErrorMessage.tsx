'use client';

import { useState } from 'react';
import { cn } from 'cn';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { toast } from './ui/toast';

type ErrorMessageProps = React.ComponentProps<'div'> & { message: string; closable?: boolean };

export function ErrorMessage(props: ErrorMessageProps) {
  const { message, className, closable = false, ...others } = props;
  const [open, setOpen] = useState(true);

  function handleClose() {
    if (closable) {
      setOpen(false);
    } else {
      toast.add({
        title: 'No, go fix it',
        type: 'error'
      });
    }
  }

  return open ? (
    <div
      {...others}
      className={cn(className, 'bg-red-400 text-white rounded-md p-3 flex gap-2 flex-col max-w-xl')}
    >
      <div className="flex justify-between">
        <h1 className="font-bold text-xl">Error</h1>
        <Button
          variant="ghost"
          onClick={handleClose}
          size="icon"
          className="hover:bg-white/30 hover:text-white"
        >
          <X />
        </Button>
      </div>
      <p>{message}</p>
    </div>
  ) : null;
}
