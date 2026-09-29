import { cn } from 'cn';

export function Header({ children, className, ...others }: React.ComponentProps<'header'>) {
  return (
    <header className={cn(className, 'p-4 border-b')} {...others}>
      {children}
    </header>
  );
}
