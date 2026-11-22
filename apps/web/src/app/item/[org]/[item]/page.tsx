import { redirect } from 'next/navigation';
import { auth } from '../../../../server/auth';
import { ItemPageContents } from './content';
import { tsrFactory } from '../../../../server/tsr-factory';
import { headers } from 'next/headers';
import { z } from 'zod';
import { PageContentWrapper } from '../../../../components/PageContentWrapper';
import { PageHeader } from '../../../../components/PageHeader';
import { PageWrapper } from '../../../../components/PageWrapper';
import { ErrorCardPage } from '../../../../components/ErrorCardPage';

export const dynamic = 'force-dynamic';

type OrgPageProps = {
  params: Promise<{ item: string; org: string }>;
};

const idSchema = z.number().int().gte(0);

export default async function OrgPage({ params }: OrgPageProps) {
  const { item: itemIdString, org: orgPath } = await params;

  const itemIdParseRes = idSchema.safeParse(+itemIdString);

  if (!itemIdParseRes.success) {
    return <div>Invalid item id</div>;
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (session === null) {
    redirect('/');
  }

  const tsr = await tsrFactory();
  const [org, item, itemReservations] = await Promise.all([
    tsr.organizations.getByPath.query({ params: { path: orgPath } }),
    tsr.item.getByIdAndOrgPath.query({
      params: { id: itemIdParseRes.data, orgPath }
    }),
    tsr.reservation.getByItemIdAndOrgPath.query({
      params: { orgPath, itemId: itemIdParseRes.data }
    })
  ]);

  if (item.status !== 200 || org.status !== 200 || org.body.org === null) {
    return <ErrorCardPage title="Item not found">That item could not be found</ErrorCardPage>;
  }

  if (itemReservations.status !== 200) {
    return (
      <ErrorCardPage title="Failed fetching item reservations">
        There was an error getting reservation for this item
      </ErrorCardPage>
    );
  }

  return (
    <PageWrapper>
      <PageHeader />
      <PageContentWrapper className="h-full">
        <ItemPageContents
          item={item.body}
          org={org.body.org}
          defaultReservations={itemReservations.body}
        />
      </PageContentWrapper>
    </PageWrapper>
  );
}
