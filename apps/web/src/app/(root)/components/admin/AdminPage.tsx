import { OrgSidebar } from '../../../../components/OrgSidebar';
import { PageContentWrapper } from '../../../../components/PageContentWrapper';
import { tsrFactory } from '../../../../server/tsr-factory';
import { InitItems } from '../../../../stores/client-helpers/InitItems';
import { InitOrgs } from '../../../../stores/client-helpers/InitOrgs';
import { extractBodyOrDefault, groupItems } from '../../../../utils/utils';
import { AdminContent } from './content';

export const dynamic = 'force-dynamic';

export async function AdminPage() {
  const tsr = await tsrFactory();
  const orgInfoRes = await tsr.organizations.getInfoForAdmin.query();
  const info = extractBodyOrDefault(orgInfoRes, []);
  const groupedItems = groupItems(info);

  return (
    <div className="flex flex-1 min-h-0">
      <InitOrgs orgs={info.map((entry) => entry.org)} />
      <InitItems items={groupedItems} />
      <OrgSidebar current="" />
      <PageContentWrapper>
        <AdminContent orgInfo={info} />
      </PageContentWrapper>
    </div>
  );
}
