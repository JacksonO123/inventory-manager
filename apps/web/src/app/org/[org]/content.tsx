import { ArrowLeft, Building2, Check, Globe, Hash, Link2, SearchX } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../../components/ui/card';
import { Separator } from '../../../components/ui/separator';
import type { Org } from '../../../types/types';

type OrgPageContentProps = {
  path: string;
  org: Org | null;
};

export function OrgPageContent({ path, org }: OrgPageContentProps) {
  return (
    <main className="flex justify-center pt-8 px-20">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <div>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft /> Back
            </Button>
          </Link>
        </div>
        {org ? (
          <>
            <Card>
              <CardHeader>
                <div className="flex gap-5 items-center">
                  <div className="rounded-2xl bg-primary/10 size-24 flex justify-center items-center shrink-0">
                    {org.svgDataUrl ? (
                      <img src={org.svgDataUrl} className="size-12" />
                    ) : (
                      <Globe className="size-12 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-3xl">{org.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 mt-1">
                      <Link2 />
                      <span className="truncate">/org/{org.path}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <p className="text-base leading-relaxed text-muted-foreground">
                  {org.description || 'No description provided.'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 /> Details
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <DetailRow label="ID" value={String(org.id)} icon={<Hash />} />
                <DetailRow label="Path" value={`/org/${org.path}`} icon={<Link2 />} />
                <DetailRow
                  label="Logo"
                  value={org.svgDataUrl ? 'Set' : 'None'}
                  icon={org.svgDataUrl ? <Check /> : <Globe />}
                />
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="rounded-full bg-muted size-16 flex justify-center items-center">
                <SearchX className="size-8 text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-xl font-medium">Organization not found</h1>
                <p className="text-sm text-muted-foreground">
                  No organization exists at <span className="font-mono">/org/{path}</span>.
                </p>
              </div>
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft /> Back to home
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

function DetailRow({
  label,
  value,
  icon
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 px-4 py-3">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium truncate">{value}</span>
    </div>
  );
}
