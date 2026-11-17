import { redirect } from 'next/navigation';
import { auth } from '../../../../server/auth';
import { ItemPageContents } from './content';
import { tsrFactory } from '../../../../server/tsrFactory';
import { headers } from 'next/headers';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

type OrgPageProps = {
  params: Promise<{ item: string; org: string }>;
};

const idSchema = z.number().int().gte(0);

export default async function OrgPage({ params }: OrgPageProps) {
  const { item: itemIdString, org: orgPath } = await params;

  const itemIdParseRes = idSchema.safeParse(itemIdString);

  if (itemIdParseRes.error !== undefined) {
    // TODO - make better
    return <div>Invalid item id</div>;
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (session === null) {
    redirect('/');
  }

  const tsr = await tsrFactory();
  const org = await tsr.organizations.getByPath.query({ params: { path: orgPath } });

  if (org.status !== 200 || org.body.org === null) {
    // TODO - make better
    return <div>Org not found</div>;
  }

  const item = await tsr.item.getByIdAndOrgId.query({
    params: { id: itemIdParseRes.data, orgId: org.body.org.id }
  });

  if (item.status !== 200) {
    return <div>Item not found</div>;
  }

  return <ItemPageContents item={item.body} org={org.body.org} />;
}
