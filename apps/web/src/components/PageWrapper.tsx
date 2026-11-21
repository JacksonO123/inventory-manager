import { cn } from 'cn';

type PageWrapperProps = React.ComponentProps<'div'>;

export function PageWrapper({ className, ...props }: PageWrapperProps) {
  return <div className={cn(className, 'h-screen flex flex-col overflow-hidden')} {...props} />;
}
