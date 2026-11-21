import { ArrowLeft, SearchX } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { Card, CardContent } from './ui/card';
import Link from 'next/link';
import { Button } from './ui/button';
import { PageWrapper } from './PageWrapper';
import { PageContentWrapper } from './PageContentWrapper';
import { BackLink } from './BackLink';

type ErrorCardProps = {
  children: React.ReactNode;
  title: React.ReactNode;
};

export function ErrorCardPage(props: ErrorCardProps) {
  return (
    <PageWrapper>
      <PageHeader />
      <PageContentWrapper>
        <ErrorCard {...props} />
      </PageContentWrapper>
    </PageWrapper>
  );
}

export function ErrorCard({ children, title }: ErrorCardProps) {
  return (
    <Card className="min-w-xl">
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="rounded-full bg-muted size-16 flex justify-center items-center">
          <SearchX className="size-8 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-medium">{title}</h1>
          <p className="text-sm text-muted-foreground">{children}</p>
        </div>
        <BackLink href="/">Dashboard</BackLink>
      </CardContent>
    </Card>
  );
}
