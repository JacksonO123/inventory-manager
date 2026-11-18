import { cn } from 'cn';

type PageContentWrapperProps = React.ComponentProps<'main'>;

export function PageContentWrapper({ className, children, ...props }: PageContentWrapperProps) {
  return (
    <main className={cn(className, 'flex justify-center py-8 px-20')} {...props}>
      <div className="w-full max-w-5xl">{children}</div>
    </main>
  );
}
