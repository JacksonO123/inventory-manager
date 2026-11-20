import { OrgSidebar } from '../../../../components/OrgSidebar';
import { PageContentWrapper } from '../../../../components/PageContentWrapper';
import { tsrFactory } from '../../../../server/tsr-factory';
import { AdminContent } from './content';

export const dynamic = 'force-dynamic';

export async function AdminPage() {
  const tsr = await tsrFactory();
  const orgInfoRes = await tsr.organizations.getInfoForAdmin.query();
  const orgInfo = orgInfoRes.status === 200 ? orgInfoRes.body : [];

  return (
    <div className="flex flex-1 min-h-0">
      <OrgSidebar orgs={orgInfo.map((info) => info.org)} current="" />
      <PageContentWrapper>
        <AdminContent orgInfo={orgInfo} />
      </PageContentWrapper>
    </div>
  );
}
