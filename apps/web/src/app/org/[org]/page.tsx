import { tsrFactory } from '../../../server/tsrFactory';
import { OrgPageContent } from './content';

export const dynamic = 'force-dynamic';

type OrgPageProps = {
  params: Promise<{ org: string }>;
};

export default async function OrgPage({ params }: OrgPageProps) {
  const { org: path } = await params;
  const tsr = await tsrFactory();
  const res = await tsr.organizations.getByPath.query({ params: { path } });

  return <OrgPageContent path={path} org={res.status === 200 ? res.body.org : null} />;
}
