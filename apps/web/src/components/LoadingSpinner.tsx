import { cn } from 'cn';
import { LoaderCircle } from 'lucide-react';

export function LoadingSpinner({ className, ...other }: React.ComponentProps<typeof LoaderCircle>) {
  return <LoaderCircle className={cn('animate-spin size-4 text-primary', className)} {...other} />;
}
