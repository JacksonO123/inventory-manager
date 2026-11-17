import { ArrowLeft, SearchX } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { Card, CardContent } from './ui/card';
import Link from 'next/link';
import { Button } from './ui/button';

type ErrorCardProps = {
  children: React.ReactNode;
  title: React.ReactNode;
};

export function ErrorCardPage(props: ErrorCardProps) {
  return (
    <div className="w-screen h-screen flex flex-col">
      <PageHeader />
      <div className="h-full w-full flex justify-center items-center">
        <ErrorCard {...props} />
      </div>
    </div>
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
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft /> Back to home
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
