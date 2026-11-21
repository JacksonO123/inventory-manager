import Link from 'next/link';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

type BackLinkProps = React.ComponentProps<typeof Link>;

export function BackLink({ children, ...props }: BackLinkProps) {
  return (
    <Link {...props}>
      <Button variant="ghost" size="sm">
        <ArrowLeft />
        Back to {children}
      </Button>
    </Link>
  );
}
