import { cn } from 'cn';

type PageContentWrapperProps = React.ComponentProps<'main'> & {
  injectOutsideCenter?: React.ReactNode;
};

export function PageContentWrapper({
  className,
  children,
  injectOutsideCenter,
  ...props
}: PageContentWrapperProps) {
  return (
    <main
      className={cn(
        'flex justify-center py-8 px-20 flex-1 min-h-0 overflow-scroll relative',
        className
      )}
      {...props}
    >
      {injectOutsideCenter}
      <div className="w-full max-w-5xl">{children}</div>
    </main>
  );
}
