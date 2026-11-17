import { ArrowLeft, SearchX } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { tsrFactory } from '../../../server/tsrFactory';
import { OrgPageContent } from './content';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { PageHeader } from '../../../components/PageHeader';

export const dynamic = 'force-dynamic';

type OrgPageProps = {
  params: Promise<{ org: string }>;
};

export default async function OrgPage({ params }: OrgPageProps) {
  const { org: path } = await params;
  const tsr = await tsrFactory();
  const org = await tsr.organizations.getByPath.query({ params: { path } });

  if (org.status !== 200 || org.body.org === null) {
    return (
      <ErrorCard title={'Organization not found'}>
        Organization exists at <span className="font-mono">/org/{path}</span>.
      </ErrorCard>
    );
  }

  const items = await tsr.item.getItemsFromOrg.query({ params: { orgId: org.body.org.id } });
  if (items.status !== 200) {
    console.log(items);
    return <ErrorCard title="asdf">asdf</ErrorCard>;
  }

  return <OrgPageContent path={path} org={org.body.org} items={items.body} />;
}

type ErrorCardProps = {
  children: React.ReactNode;
  title: React.ReactNode;
};

function ErrorCard({ children, title }: ErrorCardProps) {
  return (
    <div className="w-screen h-screen flex flex-col">
      <PageHeader />
      <div className="h-full w-full flex justify-center items-center">
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
      </div>
    </div>
  );
}
